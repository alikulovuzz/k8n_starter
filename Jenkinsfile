pipeline {
  agent any

  triggers {
    // every 5 minutes
    pollSCM('H/5 * * * *')
  }

  environment {
    APP_NAME   = 'k3s-api'
    DEPLOY_TAG = "${APP_NAME}:${BUILD_NUMBER}"
    TARBALL    = "${APP_NAME}-${BUILD_NUMBER}.tar"
    KUBECONFIG = '/var/lib/jenkins/.kube/config'
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
        // Patch Deployment to point at the new tag (triggers rolling update)
        sh "sudo kubectl --kubeconfig=${KUBECONFIG} set image deployment/${APP_NAME} ${APP_NAME}=${DEPLOY_TAG}"
      }
    }
  }

  post {
    success {
      echo "✅ Deployed ${DEPLOY_TAG} to k3s!"
    }
    failure {
      echo "❌ Pipeline failed – check console output."
    }
  }
}
