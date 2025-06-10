pipeline {
  agent any
  
  triggers {
    pollSCM('H/1 * * * *')
  }
  
  environment {
    APP_NAME   = 'k3s-api'
    DEPLOY_TAG = "${APP_NAME}:${BUILD_NUMBER}"
    TARBALL    = "${APP_NAME}-${BUILD_NUMBER}.tar"
    KUBECONFIG = '/var/lib/jenkins/.kube/config'
    
    // Email configuration
    EMAIL_RECIPIENTS = 'your-email@example.com,team@example.com'
    EMAIL_SUBJECT_SUCCESS = "✅ ${APP_NAME} Build #${BUILD_NUMBER} - SUCCESS"
    EMAIL_SUBJECT_FAILURE = "❌ ${APP_NAME} Build #${BUILD_NUMBER} - FAILED"
  }
  
  stages {
    stage('Clone') {
      steps {
        git 'https://github.com/alikulovuzz/k8n_starter.git'
      }
    }
    
    stage('Build') {
      steps {
        sh "docker build -t ${DEPLOY_TAG} ."
      }
    }
    
    stage('Export') {
      steps {
        sh "docker save ${DEPLOY_TAG} -o ${TARBALL}"
      }
    }
    
    stage('Import into k3s') {
      steps {
        sh "sudo k3s ctr images import ${TARBALL}"
      }
    }
    
    stage('Deploy') {
      steps {
        sh "sudo kubectl --kubeconfig=${KUBECONFIG} set image deployment/${APP_NAME} ${APP_NAME}=${DEPLOY_TAG}"
      }
    }
    
    stage('Cleanup') {
      steps {
        script {
          sh "rm -f ${TARBALL}"
          sh """
            docker images ${APP_NAME} --format '{{.Tag}}' | sort -nr | tail -n +4 | while read tag; do
              docker rmi ${APP_NAME}:\$tag || true
            done
          """
          sh """
            sudo k3s ctr images list | grep ${APP_NAME} | awk '{print \$1}' | sort -V | head -n -3 | while read img; do
              sudo k3s ctr images rm \$img || true
            done
          """
          sh "docker system prune -f"
        }
      }
    }
  }
  
  post {
    success {
      echo "✅ Deployed ${DEPLOY_TAG} to k3s!"
      
      // Send success email
      emailext (
        subject: "${EMAIL_SUBJECT_SUCCESS}",
        body: """
          <h2>Build Successful! 🎉</h2>
          <p><strong>Project:</strong> ${APP_NAME}</p>
          <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
          <p><strong>Deploy Tag:</strong> ${DEPLOY_TAG}</p>
          <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
          <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
          <p><strong>Status:</strong> <span style="color: green;">SUCCESS</span></p>
          
          <h3>Changes:</h3>
          <ul>
            ${currentBuild.changeSets.collect { cs ->
              cs.collect { entry ->
                "<li><strong>${entry.author}</strong>: ${entry.msg}</li>"
              }.join('')
            }.join('')}
          </ul>
          
          <p>Application has been successfully deployed to k3s cluster.</p>
        """,
        mimeType: 'text/html',
        to: "${EMAIL_RECIPIENTS}"
      )
    }
    
    failure {
      echo "❌ Pipeline failed – check console output."
      
      // Send failure email
      emailext (
        subject: "${EMAIL_SUBJECT_FAILURE}",
        body: """
          <h2>Build Failed! ❌</h2>
          <p><strong>Project:</strong> ${APP_NAME}</p>
          <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
          <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
          <p><strong>Console Output:</strong> <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
          <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
          <p><strong>Status:</strong> <span style="color: red;">FAILED</span></p>
          
          <h3>Failed Stage:</h3>
          <p>${currentBuild.result}</p>
          
          <h3>Changes:</h3>
          <ul>
            ${currentBuild.changeSets.collect { cs ->
              cs.collect { entry ->
                "<li><strong>${entry.author}</strong>: ${entry.msg}</li>"
              }.join('')
            }.join('')}
          </ul>
          
          <p>Please check the console output for detailed error information.</p>
        """,
        mimeType: 'text/html',
        to: "${EMAIL_RECIPIENTS}"
      )
    }
    
    unstable {
      // Send unstable email
      emailext (
        subject: "⚠️ ${APP_NAME} Build #${BUILD_NUMBER} - UNSTABLE",
        body: """
          <h2>Build Unstable! ⚠️</h2>
          <p><strong>Project:</strong> ${APP_NAME}</p>
          <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
          <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
          <p><strong>Console Output:</strong> <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
          <p><strong>Status:</strong> <span style="color: orange;">UNSTABLE</span></p>
          
          <p>Build completed but with some issues. Please review.</p>
        """,
        mimeType: 'text/html',
        to: "${EMAIL_RECIPIENTS}"
      )
    }
    
    always {
      // Cleanup
      script {
        sh "rm -f ${TARBALL} || true"
        sh "docker image prune -f || true"
      }
    }
  }
}