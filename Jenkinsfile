pipeline {
    agent any

    triggers {
        // Har 5 daqiqada Git reposini tekshiradi, oʼzgarish boʼlsa build ishga tushadi
        pollSCM('H/5 * * * *')
    }

    environment {
        APP_NAME = "k3s-api"
        IMAGE_NAME = "${APP_NAME}:latest"
        TARBALL = "${APP_NAME}.tar"
    }

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/alikulovuzz/k8n_starter.git' // o'zingizni repo
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Export as tar') {
            steps {
                sh 'docker save $IMAGE_NAME -o $TARBALL'
            }
        }

        stage('Import into k3s') {
            steps {
                sh 'sudo k3s ctr images import $TARBALL'
            }
        }

        stage('Deploy to K3s') {
            steps {
                sh 'kubectl apply -f k8s/deployment.yaml'
                sh 'kubectl apply -f k8s/service.yaml'
            }
        }
    }
}
