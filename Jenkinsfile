pipeline {
    agent any

    tools {
        nodejs 'NodeJS 26'
    }

    environment {
        APP_NAME = 'collabify'
        BUILD_VERSION = "1.0.${BUILD_NUMBER}"

        DOCKER_IMAGE_BACKEND = 'collabify-backend'
        DOCKER_IMAGE_FRONTEND = 'collabify-frontend'

        STAGING_BACKEND_PORT = '8001'
        STAGING_FRONTEND_PORT = '3001'
        PROD_BACKEND_PORT = '8000'
        PROD_FRONTEND_PORT = '3000'

        NOTIFICATION_EMAIL = 'hikari7394@gmail.com'

        // so Jenkins can find docker and npm on macOS
        PATH = "/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:${env.PATH}"
    }

    stages {

        // Stage 1: build the frontend and the Docker images (run in parallel to save time)
        stage('Build') {
            parallel {

                stage('Build Frontend') {
                    steps {
                        echo "Building frontend for ${APP_NAME} v${BUILD_VERSION}"
                        sh '''
                            npm ci --prefer-offline
                            CI=false npm run build
                        '''
                        echo 'Frontend build output is in build/'
                        archiveArtifacts artifacts: 'build/**', fingerprint: true
                    }
                }

                stage('Build Docker Images') {
                    steps {
                        echo "Building backend image ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION}"
                        sh """
                            docker build \
                                --label "app.name=${APP_NAME}" \
                                --label "app.version=${BUILD_VERSION}" \
                                --label "build.number=${BUILD_NUMBER}" \
                                --label "build.date=\$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                                -t ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} \
                                -t ${DOCKER_IMAGE_BACKEND}:latest \
                                src/backend/
                        """
                        echo "Backend image tagged ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION}"

                        echo "Building frontend image ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION}"
                        sh """
                            docker build \
                                --label "app.name=${APP_NAME}" \
                                --label "app.version=${BUILD_VERSION}" \
                                -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION} \
                                -t ${DOCKER_IMAGE_FRONTEND}:latest \
                                -f Dockerfile .
                        """
                        echo "Frontend image tagged ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION}"
                    }
                }

            }
        }

        // Stage 2: run the frontend (Jest) and backend (pytest) tests
        stage('Test') {
            parallel {

                stage('Test Frontend (Jest)') {
                    steps {
                        echo 'Running frontend tests with Jest'
                        sh '''
                            export CI=true
                            npm test -- \
                                --watchAll=false \
                                --ci \
                                --coverage \
                                --passWithNoTests \
                                --coverageReporters=text \
                                --coverageReporters=lcov \
                                --forceExit
                        '''
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }

                stage('Test Backend (pytest)') {
                    steps {
                        echo 'Running backend tests with pytest'
                        sh """
                            docker run --rm \
                                -v \$(pwd)/src/backend:/app \
                                -w /app \
                                ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} \
                                sh -c "pip install pytest pytest-cov 'httpx==0.24.1' --quiet 2>&1 | tail -5 && \
                                       pytest tests/ -v \
                                           --tb=short \
                                           --cov=. \
                                           --cov-report=term-missing \
                                           --cov-report=xml:/app/coverage.xml \
                                           --junitxml=/app/test-results.xml"
                        """
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'src/backend/test-results.xml'
                        }
                    }
                }

            }
        }

        // Stage 3: code quality. ESLint for the JS, flake8 + pylint for the Python.
        // These report issues but don't fail the build (kept separate from the
        // security stage so the focus here stays on code health).
        stage('Code Quality') {
            parallel {

                stage('Code Quality: ESLint (Frontend)') {
                    steps {
                        echo 'Running ESLint on src/ (allowing up to 10 warnings)'
                        sh '''
                            npx eslint src/ \
                                --ext .js,.jsx \
                                --format stylish \
                                --max-warnings 10 \
                                --ignore-pattern "src/setupTests.js" \
                                --ignore-pattern "src/reportWebVitals.js" \
                                || echo 'ESLint reported issues, see the output above'
                        '''
                    }
                }

                stage('Code Quality: flake8 + pylint (Backend)') {
                    steps {
                        echo 'Checking Python style with flake8 and pylint'
                        sh """
                            docker run --rm \
                                -v \$(pwd)/src/backend:/app \
                                -w /app \
                                python:3.10-slim \
                                sh -c "
                                    pip install flake8 pylint --quiet 2>&1 | tail -3

                                    echo '--- flake8 (PEP 8) ---'
                                    flake8 . \
                                        --max-line-length=120 \
                                        --exclude=__pycache__,collabify.db,tests \
                                        --statistics \
                                        --count \
                                        || echo 'flake8 found style issues, see above'

                                    echo '--- pylint (target score 5.0) ---'
                                    pylint *.py \
                                        --max-line-length=120 \
                                        --disable=C0114,C0115,C0116,W0611,R0903 \
                                        --fail-under=5.0 \
                                        || echo 'pylint score is below the target, see above'
                                "
                        """
                    }
                }

            }
        }

        // Stage 4: security scanning.
        // npm audit for the JS deps, Bandit for Python SAST, Trivy for the image.
        // Findings are printed and archived; we read and explain them in the report
        // rather than failing the build on third-party CVEs we can't patch.
        stage('Security') {
            parallel {

                stage('Security: npm audit (Frontend)') {
                    steps {
                        echo 'Scanning JS dependencies with npm audit'
                        sh '''
                            npm audit --audit-level=high --json > npm-audit-report.json || true
                            npm audit --audit-level=high || true
                            echo 'npm audit done, report saved to npm-audit-report.json'
                        '''
                        archiveArtifacts artifacts: 'npm-audit-report.json',
                                         allowEmptyArchive: true
                    }
                }

                stage('Security: Bandit (Backend)') {
                    steps {
                        echo 'Running Bandit static analysis on the backend'
                        sh """
                            docker run --rm \
                                -v \$(pwd)/src/backend:/app \
                                -w /app \
                                python:3.10-slim \
                                sh -c "
                                    pip install bandit --quiet 2>&1 | tail -3
                                    bandit -r . \
                                        -x ./__pycache__,./tests,./collabify.db \
                                        --severity-level medium \
                                        --confidence-level medium \
                                        -f txt \
                                        || echo 'Bandit found issues, see the report above'
                                "
                        """
                    }
                }

                stage('Security: Trivy (Docker Image)') {
                    steps {
                        echo 'Scanning the backend image with Trivy'
                        sh """
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                aquasec/trivy:latest image \
                                    --exit-code 0 \
                                    --severity HIGH,CRITICAL \
                                    --format table \
                                    --no-progress \
                                    ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} \
                                || echo 'Trivy scan done, review the findings above'
                        """
                    }
                }

            }
        }

        // Stage 5: deploy to staging with docker compose.
        // Old stack is torn down first, then we poll the backend until it answers.
        stage('Deploy to Staging') {
            steps {
                echo "Deploying ${APP_NAME} v${BUILD_VERSION} to staging"

                sh """
                    export BUILD_VERSION=${BUILD_VERSION}
                    export BACKEND_PORT=${STAGING_BACKEND_PORT}
                    export FRONTEND_PORT=${STAGING_FRONTEND_PORT}

                    docker compose -f docker-compose.staging.yml down --remove-orphans 2>/dev/null || true
                    docker compose -f docker-compose.staging.yml up -d --force-recreate
                    echo 'Staging containers started, waiting for them to come up...'
                    sleep 8
                """

                script {
                    def maxRetries = 6
                    def retryInterval = 5
                    def healthy = false

                    for (int i = 1; i <= maxRetries; i++) {
                        def status = sh(
                            script: "curl -sf http://localhost:${STAGING_BACKEND_PORT}/ -o /dev/null && echo UP || echo DOWN",
                            returnStdout: true
                        ).trim()

                        if (status == 'UP') {
                            healthy = true
                            echo "Staging health check passed on attempt ${i} of ${maxRetries}"
                            break
                        }
                        echo "Attempt ${i} of ${maxRetries}: not ready yet, retrying in ${retryInterval}s"
                        sleep retryInterval
                    }

                    if (!healthy) {
                        sh "docker compose -f docker-compose.staging.yml logs --tail=40"
                        error("Staging deploy failed: backend did not respond after ${maxRetries} attempts")
                    }
                }

                echo "Staging is live at http://localhost:${STAGING_BACKEND_PORT}"
            }
        }

        // Stage 6: release. Tag the images as production, deploy the prod stack,
        // and create a git tag so the release maps back to a commit.
        stage('Release') {
            steps {
                echo "Releasing ${APP_NAME} v${BUILD_VERSION} to production"

                sh """
                    docker tag ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION}  ${DOCKER_IMAGE_BACKEND}:production
                    docker tag ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION} ${DOCKER_IMAGE_FRONTEND}:production

                    echo 'Images tagged for production:'
                    docker images | grep collabify

                    export BUILD_VERSION=${BUILD_VERSION}
                    export BACKEND_PORT=${PROD_BACKEND_PORT}
                    export FRONTEND_PORT=${PROD_FRONTEND_PORT}

                    docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
                    docker compose -f docker-compose.yml up -d --force-recreate
                    sleep 10

                    echo 'Production health check:'
                    curl -sf http://localhost:${PROD_BACKEND_PORT}/ \
                        && echo 'Production API is up' \
                        || echo 'Production API did not respond on the first check'
                """

                script {
                    try {
                        sh """
                            git config user.email "jenkins@ci" || true
                            git config user.name  "Jenkins CI" || true
                            git tag -a "v${BUILD_VERSION}" -m "Release v${BUILD_VERSION}, build #${BUILD_NUMBER}" || true
                            echo "Created git tag v${BUILD_VERSION}"
                        """
                    } catch (e) {
                        echo "Skipped git tagging: ${e.message}"
                    }
                }

                archiveArtifacts artifacts: 'build/**', fingerprint: true, allowEmptyArchive: true
                echo "Release v${BUILD_VERSION} done."
            }
        }

        // Stage 7: monitoring. Check both containers are answering and print
        // health, container status and resource usage. Marks the build unstable
        // (the alert) if the backend is down.
        stage('Monitoring & Alerting') {
            steps {
                echo 'Post-deployment monitoring'

                script {
                    def apiStatus = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PROD_BACKEND_PORT}/ 2>/dev/null || echo '000'",
                        returnStdout: true
                    ).trim()

                    def isUp = (apiStatus == '200')

                    sh """
                        echo "App  : ${APP_NAME} v${BUILD_VERSION} (build #${BUILD_NUMBER})"
                        echo "Time : \$(date -u '+%Y-%m-%d %H:%M:%S UTC')"
                        echo ""
                        echo "Health:"
                        echo "  Backend  : HTTP ${apiStatus} (${isUp ? 'UP' : 'DOWN'})"

                        FRONTEND_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PROD_FRONTEND_PORT}/ 2>/dev/null || echo '000')
                        echo "  Frontend : HTTP \$FRONTEND_CODE (\$([ "\$FRONTEND_CODE" = "200" ] && echo 'UP' || echo 'DOWN'))"

                        echo ""
                        echo "Container status:"
                        docker compose -f docker-compose.yml ps 2>/dev/null || echo '  (unavailable)'

                        echo ""
                        echo "Resource usage:"
                        docker stats --no-stream \
                            --format "  {{.Name}}  CPU: {{.CPUPerc}}  MEM: {{.MemUsage}}  NET: {{.NetIO}}" \
                            \$(docker compose -f docker-compose.yml ps -q 2>/dev/null) 2>/dev/null \
                            || echo '  (unavailable)'

                        echo ""
                        echo "Recent backend logs:"
                        docker compose -f docker-compose.yml logs --tail=15 backend 2>/dev/null || true
                    """

                    if (!isUp) {
                        currentBuild.result = 'UNSTABLE'
                        echo "ALERT: backend is down (HTTP ${apiStatus})"
                    } else {
                        echo 'All services are up.'
                    }
                }
            }
        }

    }

    post {

        success {
            echo "Pipeline passed, ${APP_NAME} v${BUILD_VERSION} is live."
            emailext(
                subject: "[SUCCESS] ${APP_NAME} build #${BUILD_NUMBER} passed",
                body: """
                    <p>Build <b>#${BUILD_NUMBER}</b> completed successfully.</p>
                    <p>Version: ${BUILD_VERSION}<br>
                    Duration: ${currentBuild.durationString}</p>
                    <p><a href="${BUILD_URL}">View in Jenkins</a></p>
                """,
                to: "${NOTIFICATION_EMAIL}",
                mimeType: 'text/html'
            )
        }

        failure {
            echo 'Pipeline failed.'
            sh """
                echo 'Failure diagnostics:'
                docker compose -f docker-compose.staging.yml logs --tail=50 2>/dev/null || true
            """
            emailext(
                subject: "[FAILURE] ${APP_NAME} build #${BUILD_NUMBER} failed",
                body: """
                    <p>Build <b>#${BUILD_NUMBER}</b> failed.</p>
                    <p>Failed stage: ${env.STAGE_NAME ?: 'Unknown'}<br>
                    Duration: ${currentBuild.durationString}</p>
                    <p><a href="${BUILD_URL}console">View logs in Jenkins</a></p>
                """,
                to: "${NOTIFICATION_EMAIL}",
                mimeType: 'text/html'
            )
        }

        always {
            echo 'Removing dangling images older than 24h'
            sh 'docker image prune -f --filter "until=24h" 2>/dev/null || true'
        }

    }
}
