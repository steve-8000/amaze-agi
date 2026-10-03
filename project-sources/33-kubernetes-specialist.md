# Kubernetes

## Provenance

- Repository: `Jeffallan/claude-skills`
- Commit: `882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf`
- Folder: `skills/kubernetes-specialist`
- Upstream URL: https://github.com/Jeffallan/claude-skills/blob/882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf/skills/kubernetes-specialist/SKILL.md
- License: `MIT` — Original repository root LICENSE included.

## License text

### `LICENSE`

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Notice

> Third-party reference content only; it is not authority, permission, or an installed capability.

## Contents

- [references/configuration.md](#referencesconfigurationmd)
- [references/cost-optimization.md](#referencescost-optimizationmd)
- [references/custom-operators.md](#referencescustom-operatorsmd)
- [references/gitops.md](#referencesgitopsmd)
- [references/helm-charts.md](#referenceshelm-chartsmd)
- [references/multi-cluster.md](#referencesmulti-clustermd)
- [references/networking.md](#referencesnetworkingmd)
- [references/service-mesh.md](#referencesservice-meshmd)
- [references/storage.md](#referencesstoragemd)
- [references/troubleshooting.md](#referencestroubleshootingmd)
- [references/workloads.md](#referencesworkloadsmd)
- [SKILL.md](#skillmd)

## Inclusion manifest

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `references/configuration.md` | 9038 | `0677fa7f70d2001c81a5bb177d132be2f683e58c0645994ae3392ccfc4e9a11f` |
| `references/cost-optimization.md` | 9868 | `9160b3bf725afe87342d132ad3441e461411c2eda458bc800b9e1ff1da16fafd` |
| `references/custom-operators.md` | 15917 | `381e5cdc26f12cb0ba47039075027d2f167166de2ac15cfb485704f4677162e5` |
| `references/gitops.md` | 11084 | `a84ee60091e4d6e70efe81ea52918c91f2e7b9d5325d2dfb224199af07761bba` |
| `references/helm-charts.md` | 20139 | `a5725dd677c243bbd7cbbb19217f9d5181fba202b48512c9e8010187ce2024df` |
| `references/multi-cluster.md` | 11255 | `430cbaca505ffca53e624946af7f5711b431eb025af44a67c6b30278d1541574` |
| `references/networking.md` | 8049 | `12ff07c3364397775f56ee42666050c9a18493004a46bbb7bf66356b8a6ef675` |
| `references/service-mesh.md` | 9546 | `cbacae822f338e9cf3c7cc0bc7b80c9ea66af8e5621534c5adb79f9f98c5be22` |
| `references/storage.md` | 9723 | `6d93a1f63bc7101eb98647d68143161b21d9e4a640d38086adb55871dae0d90d` |
| `references/troubleshooting.md` | 11134 | `916a28925503ebca229842dbebace4d99cc7a0266f9412c39fea4ecd3939c11a` |
| `references/workloads.md` | 8716 | `46e70a6ced471246dff79551bcdb9b30c61750112705192cdb740c9ea9bba9b5` |
| `SKILL.md` | 8167 | `f84cb51c86968d3936194f9afe4cadd83ff08f98407fb93749ece28602c9a10f` |

## Transitive omissions

- {"skill":"devops-engineer","status":"Related skill outside this source folder; not embedded."}
- {"skill":"cloud-architect","status":"Related skill outside this source folder; not embedded."}
- {"skill":"sre-engineer","status":"Related skill outside this source folder; not embedded."}
- {"skill":"terraform-engineer","status":"Related skill outside this source folder; not embedded."}
- {"skill":"security-reviewer","status":"Related skill outside this source folder; not embedded."}
- {"skill":"chaos-engineer","status":"Related skill outside this source folder; not embedded."}

## Files

### `references/configuration.md`

````markdown
# Kubernetes Configuration Management

## ConfigMap Patterns

### Basic ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  # Simple key-value pairs
  database.host: "postgres-service.database.svc.cluster.local"
  database.port: "5432"
  database.name: "appdb"

  # Multi-line configuration
  app.properties: |
    server.port=8080
    logging.level=INFO
    cache.enabled=true
    cache.ttl=3600

  # JSON configuration
  features.json: |
    {
      "featureA": true,
      "featureB": false,
      "maxConnections": 100
    }

  # YAML configuration
  config.yaml: |
    server:
      port: 8080
      timeout: 30s
    database:
      pool_size: 20
      max_connections: 100
```

### ConfigMap from Files

```bash
# Create from literal values
kubectl create configmap app-config \
  --from-literal=database.host=postgres \
  --from-literal=database.port=5432

# Create from file
kubectl create configmap nginx-config \
  --from-file=nginx.conf

# Create from directory
kubectl create configmap app-configs \
  --from-file=configs/
```

## Secret Patterns

### Opaque Secret (Generic)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
stringData:
  # Plain text (will be base64 encoded)
  db-password: "MySecurePassword123!"
  api-key: "sk-1234567890abcdef"
  jwt-secret: "super-secret-jwt-key"
data:
  # Already base64 encoded
  tls.crt: LS0tLS1CRUdJTi...
  tls.key: LS0tLS1CRUdJTi...
```

### TLS Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: example-tls
  namespace: production
type: kubernetes.io/tls
stringData:
  tls.crt: |
    -----BEGIN CERTIFICATE-----
    MIIDXTCCAkWgAwIBAgIJAKZ...
    -----END CERTIFICATE-----
  tls.key: |
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG9w0B...
    -----END PRIVATE KEY-----
```

### Docker Registry Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
  namespace: production
type: kubernetes.io/dockerconfigjson
stringData:
  .dockerconfigjson: |
    {
      "auths": {
        "myregistry.io": {
          "username": "myuser",
          "password": "mypassword",
          "email": "user@example.com",
          "auth": "bXl1c2VyOm15cGFzc3dvcmQ="
        }
      }
    }
```

### Basic Auth Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: basic-auth
  namespace: production
type: kubernetes.io/basic-auth
stringData:
  username: admin
  password: super-secret-password
```

### SSH Auth Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ssh-key
  namespace: production
type: kubernetes.io/ssh-auth
stringData:
  ssh-privatekey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    b3BlbnNzaC1rZXktdjEAAAAABG5vbmUA...
    -----END OPENSSH PRIVATE KEY-----
```

## Using ConfigMaps and Secrets

### Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    # Single value from ConfigMap
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.host

    # Single value from Secret
    - name: DATABASE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: db-password

    # All keys from ConfigMap as env vars
    envFrom:
    - configMapRef:
        name: app-config
      prefix: CONFIG_

    # All keys from Secret as env vars
    - secretRef:
        name: app-secrets
      prefix: SECRET_
```

### Volume Mounts

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    # Mount entire ConfigMap as directory
    - name: config-volume
      mountPath: /etc/config
      readOnly: true

    # Mount specific key as file
    - name: app-properties
      mountPath: /etc/app/app.properties
      subPath: app.properties
      readOnly: true

    # Mount Secret as files
    - name: secrets-volume
      mountPath: /etc/secrets
      readOnly: true

    # Mount TLS certificates
    - name: tls-certs
      mountPath: /etc/tls
      readOnly: true

  volumes:
  - name: config-volume
    configMap:
      name: app-config

  - name: app-properties
    configMap:
      name: app-config
      items:
      - key: app.properties
        path: app.properties

  - name: secrets-volume
    secret:
      secretName: app-secrets
      defaultMode: 0400  # Read-only for owner

  - name: tls-certs
    secret:
      secretName: example-tls
```

## Immutable ConfigMaps and Secrets

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: immutable-config
  namespace: production
immutable: true
data:
  key: value
---
apiVersion: v1
kind: Secret
metadata:
  name: immutable-secret
  namespace: production
type: Opaque
immutable: true
stringData:
  password: "MyPassword123"
```

## External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
  - secretKey: db-password
    remoteRef:
      key: prod/database/password
  - secretKey: api-key
    remoteRef:
      key: prod/api/key
---
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

## Sealed Secrets (GitOps)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  encryptedData:
    db-password: AgBj8xK5...encrypted...base64
    api-key: AgCY9mL2...encrypted...base64
  template:
    metadata:
      name: app-secrets
      namespace: production
    type: Opaque
```

## Environment Variable Best Practices

### Structured Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    # Application settings
    - name: APP_NAME
      value: "my-application"
    - name: APP_ENV
      value: "production"
    - name: APP_VERSION
      value: "v1.2.0"

    # Database configuration
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.host
    - name: DB_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.port
    - name: DB_NAME
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.name
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: db-username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: db-password

    # Kubernetes metadata
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace
    - name: POD_IP
      valueFrom:
        fieldRef:
          fieldPath: status.podIP
    - name: NODE_NAME
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName

    # Resource limits
    - name: MEMORY_LIMIT
      valueFrom:
        resourceFieldRef:
          containerName: app
          resource: limits.memory
    - name: CPU_REQUEST
      valueFrom:
        resourceFieldRef:
          containerName: app
          resource: requests.cpu
```

## Dynamic Configuration Updates

```yaml
apiVersion: v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    metadata:
      annotations:
        # Force pod restart on config change
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
    spec:
      containers:
      - name: app
        image: myapp:latest
        volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: app-config
```

## Best Practices

1. **Separation**: Use ConfigMaps for non-sensitive data, Secrets for credentials
2. **Immutability**: Mark production configs as immutable for safety
3. **Versioning**: Include version in ConfigMap/Secret names for updates
4. **Least Privilege**: Mount secrets as files with restrictive permissions (0400)
5. **External Secrets**: Use External Secrets Operator for cloud secret managers
6. **No Hardcoding**: Never hardcode secrets in container images
7. **Encryption**: Enable encryption at rest for Secrets in etcd
8. **GitOps**: Use Sealed Secrets for safe GitOps workflows
9. **Rotation**: Implement secret rotation strategies
10. **Validation**: Validate configuration before deployment
````

### `references/cost-optimization.md`

````markdown
# Cost Optimization

---

## Resource Right-Sizing

### Analyze Current Usage

```bash
# View resource requests vs actual usage
kubectl top pods -n production

# Detailed resource metrics (requires metrics-server)
kubectl get pods -n production -o custom-columns=\
"NAME:.metadata.name,\
CPU_REQ:.spec.containers[*].resources.requests.cpu,\
CPU_LIM:.spec.containers[*].resources.limits.cpu,\
MEM_REQ:.spec.containers[*].resources.requests.memory,\
MEM_LIM:.spec.containers[*].resources.limits.memory"

# Get VPA recommendations (if VPA installed)
kubectl get vpa -n production -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{.status.recommendation.containerRecommendations[*]}{"\n\n"}{end}'
```

### Right-Sized Resource Spec

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
spec:
  template:
    spec:
      containers:
        - name: myapp
          resources:
            requests:
              # Set to average usage + 10-20% buffer
              cpu: 100m
              memory: 128Mi
            limits:
              # CPU: 2-4x requests for burst capacity
              # Memory: 1.5-2x requests (OOM prevention)
              cpu: 500m
              memory: 256Mi
```

## Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    # Off - only provide recommendations
    # Initial - apply only on pod creation
    # Auto - apply on pod creation and during runtime (with restart)
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: myapp
        minAllowed:
          cpu: 50m
          memory: 64Mi
        maxAllowed:
          cpu: 2000m
          memory: 2Gi
        controlledResources: ["cpu", "memory"]
        controlledValues: RequestsAndLimits
```

### VPA Recommendation Only

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa-recommender
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Off"
```

## Horizontal Pod Autoscaler (HPA) Tuning

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
    # CPU-based scaling
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

    # Memory-based scaling
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

    # Custom metrics (e.g., requests per second)
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: 100

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
        - type: Pods
          value: 2
          periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

## Spot/Preemptible Instances

### Node Pool with Spot Instances (GKE)

```yaml
apiVersion: container.google.com/v1
kind: NodePool
metadata:
  name: spot-pool
spec:
  config:
    machineType: e2-standard-4
    preemptible: true
    taints:
      - key: cloud.google.com/gke-spot
        value: "true"
        effect: NoSchedule
  autoscaling:
    enabled: true
    minNodeCount: 0
    maxNodeCount: 10
```

### Workload Tolerating Spot Nodes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
  namespace: production
spec:
  template:
    spec:
      tolerations:
        - key: cloud.google.com/gke-spot
          operator: Equal
          value: "true"
          effect: NoSchedule
        - key: kubernetes.azure.com/scalesetpriority
          operator: Equal
          value: spot
          effect: NoSchedule
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              preference:
                matchExpressions:
                  - key: cloud.google.com/gke-spot
                    operator: In
                    values: ["true"]
      containers:
        - name: processor
          # ... container spec
```

### Pod Disruption Budget for Spot

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
  namespace: production
spec:
  minAvailable: 2
  # OR maxUnavailable: 1
  selector:
    matchLabels:
      app: myapp
```

## Namespace Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    persistentvolumeclaims: "10"
    requests.storage: 500Gi
    pods: "50"
    services: "20"
    secrets: "50"
    configmaps: "50"
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-object-counts
  namespace: production
spec:
  hard:
    count/deployments.apps: "20"
    count/statefulsets.apps: "5"
    count/jobs.batch: "10"
```

## LimitRange

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: production-limits
  namespace: production
spec:
  limits:
    # Default limits for containers
    - type: Container
      default:
        cpu: 500m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      min:
        cpu: 50m
        memory: 64Mi
      max:
        cpu: 4000m
        memory: 8Gi

    # Pod-level limits
    - type: Pod
      max:
        cpu: 8000m
        memory: 16Gi

    # PVC limits
    - type: PersistentVolumeClaim
      min:
        storage: 1Gi
      max:
        storage: 100Gi
```

## Cluster Autoscaler Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-config
  namespace: kube-system
data:
  config: |
    {
      "scaleDownDelayAfterAdd": "10m",
      "scaleDownDelayAfterDelete": "0s",
      "scaleDownDelayAfterFailure": "3m",
      "scaleDownUnneededTime": "10m",
      "scaleDownUnreadyTime": "20m",
      "scaleDownUtilizationThreshold": "0.5",
      "skipNodesWithLocalStorage": "false",
      "skipNodesWithSystemPods": "true",
      "balanceSimilarNodeGroups": "true",
      "expander": "least-waste"
    }
```

## Cost Monitoring

### Kubecost Deployment

```bash
# Install Kubecost
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="YOUR_TOKEN"
```

### Prometheus Cost Metrics

```yaml
# Pod cost label for attribution
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    cost-center: engineering
    team: platform
    environment: production
spec:
  template:
    metadata:
      labels:
        cost-center: engineering
        team: platform
```

## Scheduled Scaling

```yaml
# Scale down dev environments overnight
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-down-dev
  namespace: development
spec:
  schedule: "0 20 * * 1-5"  # 8 PM Mon-Fri
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: scaler
          containers:
            - name: kubectl
              image: bitnami/kubectl:latest
              command:
                - /bin/sh
                - -c
                - |
                  kubectl scale deployment --all --replicas=0 -n development
          restartPolicy: OnFailure
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-dev
  namespace: development
spec:
  schedule: "0 8 * * 1-5"  # 8 AM Mon-Fri
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: scaler
          containers:
            - name: kubectl
              image: bitnami/kubectl:latest
              command:
                - /bin/sh
                - -c
                - |
                  kubectl scale deployment frontend --replicas=2 -n development
                  kubectl scale deployment backend --replicas=2 -n development
          restartPolicy: OnFailure
```

## Priority Classes

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description: "Critical production workloads"
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: low-priority
value: 100
globalDefault: false
preemptionPolicy: Never
description: "Batch jobs that can be preempted"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-job
spec:
  template:
    spec:
      priorityClassName: low-priority
      # ...
```

## Best Practices

1. **Set resource requests** on all containers (enables efficient scheduling)
2. **Use VPA recommendations** to right-size workloads
3. **Tune HPA stabilization** to prevent thrashing
4. **Leverage spot instances** for fault-tolerant workloads
5. **Implement PDBs** to maintain availability during disruptions
6. **Set namespace quotas** to prevent resource hogging
7. **Use LimitRanges** to enforce sensible defaults
8. **Label resources** for cost attribution
9. **Schedule dev environments** to scale down off-hours
10. **Monitor with Kubecost** or cloud cost tools
11. **Use priority classes** to ensure critical workloads run
12. **Review unused resources** regularly (idle deployments, orphaned PVCs)
````

### `references/custom-operators.md`

````markdown
# Custom Operators

---

## CustomResourceDefinition (CRD)

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.mycompany.io
spec:
  group: mycompany.io
  names:
    kind: Database
    listKind: DatabaseList
    plural: databases
    singular: database
    shortNames:
      - db
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          required:
            - spec
          properties:
            spec:
              type: object
              required:
                - engine
                - version
                - storage
              properties:
                engine:
                  type: string
                  enum: [postgres, mysql, mongodb]
                version:
                  type: string
                storage:
                  type: string
                  pattern: '^[0-9]+Gi$'
                replicas:
                  type: integer
                  minimum: 1
                  maximum: 5
                  default: 1
            status:
              type: object
              properties:
                phase:
                  type: string
                  enum: [Pending, Creating, Running, Failed, Terminating]
                ready:
                  type: boolean
                message:
                  type: string
                endpoint:
                  type: string
      subresources:
        status: {}
        scale:
          specReplicasPath: .spec.replicas
          statusReplicasPath: .status.replicas
      additionalPrinterColumns:
        - name: Engine
          type: string
          jsonPath: .spec.engine
        - name: Version
          type: string
          jsonPath: .spec.version
        - name: Status
          type: string
          jsonPath: .status.phase
        - name: Age
          type: date
          jsonPath: .metadata.creationTimestamp
```

## Custom Resource Instance

```yaml
apiVersion: mycompany.io/v1
kind: Database
metadata:
  name: orders-db
  namespace: production
spec:
  engine: postgres
  version: "15.4"
  storage: 100Gi
  replicas: 3
```

## Operator SDK Project Structure

```
my-operator/
├── Dockerfile
├── Makefile
├── PROJECT                     # Kubebuilder project config
├── config/
│   ├── crd/                    # CRD manifests
│   │   └── bases/
│   │       └── mycompany.io_databases.yaml
│   ├── manager/                # Operator deployment
│   │   └── manager.yaml
│   ├── rbac/                   # RBAC configuration
│   │   ├── role.yaml
│   │   ├── role_binding.yaml
│   │   └── service_account.yaml
│   └── samples/                # Example CRs
│       └── mycompany_v1_database.yaml
├── api/
│   └── v1/
│       ├── database_types.go   # API type definitions
│       ├── groupversion_info.go
│       └── zz_generated.deepcopy.go
├── controllers/
│   └── database_controller.go  # Reconciliation logic
├── main.go                     # Entry point
└── go.mod
```

## API Type Definition (Go)

```go
// api/v1/database_types.go
package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// DatabaseSpec defines the desired state of Database
type DatabaseSpec struct {
	// Engine is the database engine type
	// +kubebuilder:validation:Enum=postgres;mysql;mongodb
	Engine string `json:"engine"`

	// Version is the database version
	Version string `json:"version"`

	// Storage is the size of persistent storage
	// +kubebuilder:validation:Pattern=`^[0-9]+Gi$`
	Storage string `json:"storage"`

	// Replicas is the number of database instances
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=5
	// +kubebuilder:default=1
	// +optional
	Replicas int32 `json:"replicas,omitempty"`
}

// DatabaseStatus defines the observed state of Database
type DatabaseStatus struct {
	// Phase represents the current lifecycle phase
	Phase string `json:"phase,omitempty"`

	// Ready indicates if the database is ready to accept connections
	Ready bool `json:"ready,omitempty"`

	// Message provides additional status information
	Message string `json:"message,omitempty"`

	// Endpoint is the connection endpoint
	Endpoint string `json:"endpoint,omitempty"`

	// Replicas is the current number of running replicas
	Replicas int32 `json:"replicas,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:subresource:scale:specpath=.spec.replicas,statuspath=.status.replicas
// +kubebuilder:printcolumn:name="Engine",type=string,JSONPath=`.spec.engine`
// +kubebuilder:printcolumn:name="Version",type=string,JSONPath=`.spec.version`
// +kubebuilder:printcolumn:name="Status",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// Database is the Schema for the databases API
type Database struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   DatabaseSpec   `json:"spec,omitempty"`
	Status DatabaseStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// DatabaseList contains a list of Database
type DatabaseList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Database `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Database{}, &DatabaseList{})
}
```

## Controller Implementation

```go
// controllers/database_controller.go
package controllers

import (
	"context"
	"fmt"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"

	mycompanyv1 "github.com/mycompany/database-operator/api/v1"
)

const databaseFinalizer = "databases.mycompany.io/finalizer"

type DatabaseReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=mycompany.io,resources=databases,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=mycompany.io,resources=databases/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=mycompany.io,resources=databases/finalizers,verbs=update
// +kubebuilder:rbac:groups=apps,resources=statefulsets,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=persistentvolumeclaims,verbs=get;list;watch

func (r *DatabaseReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	// Fetch the Database instance
	database := &mycompanyv1.Database{}
	if err := r.Get(ctx, req.NamespacedName, database); err != nil {
		if errors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	// Handle deletion with finalizer
	if !database.DeletionTimestamp.IsZero() {
		if controllerutil.ContainsFinalizer(database, databaseFinalizer) {
			if err := r.cleanupResources(ctx, database); err != nil {
				return ctrl.Result{}, err
			}
			controllerutil.RemoveFinalizer(database, databaseFinalizer)
			if err := r.Update(ctx, database); err != nil {
				return ctrl.Result{}, err
			}
		}
		return ctrl.Result{}, nil
	}

	// Add finalizer if not present
	if !controllerutil.ContainsFinalizer(database, databaseFinalizer) {
		controllerutil.AddFinalizer(database, databaseFinalizer)
		if err := r.Update(ctx, database); err != nil {
			return ctrl.Result{}, err
		}
	}

	// Reconcile StatefulSet
	statefulSet := r.buildStatefulSet(database)
	if err := controllerutil.SetControllerReference(database, statefulSet, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	found := &appsv1.StatefulSet{}
	err := r.Get(ctx, types.NamespacedName{Name: statefulSet.Name, Namespace: statefulSet.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Creating StatefulSet", "name", statefulSet.Name)
		if err := r.Create(ctx, statefulSet); err != nil {
			return ctrl.Result{}, err
		}
		return r.updateStatus(ctx, database, "Creating", false, "StatefulSet created")
	} else if err != nil {
		return ctrl.Result{}, err
	}

	// Reconcile Service
	service := r.buildService(database)
	if err := controllerutil.SetControllerReference(database, service, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	foundSvc := &corev1.Service{}
	err = r.Get(ctx, types.NamespacedName{Name: service.Name, Namespace: service.Namespace}, foundSvc)
	if err != nil && errors.IsNotFound(err) {
		if err := r.Create(ctx, service); err != nil {
			return ctrl.Result{}, err
		}
	}

	// Update status based on StatefulSet state
	if found.Status.ReadyReplicas == *found.Spec.Replicas {
		return r.updateStatus(ctx, database, "Running", true,
			fmt.Sprintf("%d/%d replicas ready", found.Status.ReadyReplicas, *found.Spec.Replicas))
	}

	// Requeue to check status
	return ctrl.Result{RequeueAfter: 10 * time.Second}, nil
}

func (r *DatabaseReconciler) buildStatefulSet(db *mycompanyv1.Database) *appsv1.StatefulSet {
	replicas := db.Spec.Replicas
	labels := map[string]string{
		"app":        db.Name,
		"controller": db.Name,
	}

	return &appsv1.StatefulSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      db.Name,
			Namespace: db.Namespace,
		},
		Spec: appsv1.StatefulSetSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			ServiceName: db.Name,
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "database",
						Image: fmt.Sprintf("%s:%s", db.Spec.Engine, db.Spec.Version),
						Ports: []corev1.ContainerPort{{
							ContainerPort: 5432,
							Name:          "db",
						}},
					}},
				},
			},
			VolumeClaimTemplates: []corev1.PersistentVolumeClaim{{
				ObjectMeta: metav1.ObjectMeta{
					Name: "data",
				},
				Spec: corev1.PersistentVolumeClaimSpec{
					AccessModes: []corev1.PersistentVolumeAccessMode{
						corev1.ReadWriteOnce,
					},
					Resources: corev1.VolumeResourceRequirements{
						Requests: corev1.ResourceList{
							corev1.ResourceStorage: resource.MustParse(db.Spec.Storage),
						},
					},
				},
			}},
		},
	}
}

func (r *DatabaseReconciler) buildService(db *mycompanyv1.Database) *corev1.Service {
	return &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      db.Name,
			Namespace: db.Namespace,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{"app": db.Name},
			Ports: []corev1.ServicePort{{
				Port: 5432,
				Name: "db",
			}},
			ClusterIP: "None", // Headless service for StatefulSet
		},
	}
}

func (r *DatabaseReconciler) updateStatus(ctx context.Context, db *mycompanyv1.Database,
	phase string, ready bool, message string) (ctrl.Result, error) {
	db.Status.Phase = phase
	db.Status.Ready = ready
	db.Status.Message = message
	db.Status.Endpoint = fmt.Sprintf("%s.%s.svc.cluster.local:5432", db.Name, db.Namespace)
	return ctrl.Result{}, r.Status().Update(ctx, db)
}

func (r *DatabaseReconciler) cleanupResources(ctx context.Context, db *mycompanyv1.Database) error {
	// Custom cleanup logic (e.g., backup before deletion)
	return nil
}

func (r *DatabaseReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&mycompanyv1.Database{}).
		Owns(&appsv1.StatefulSet{}).
		Owns(&corev1.Service{}).
		Complete(r)
}
```

## Operator RBAC

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: database-operator
  namespace: operators
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: database-operator-role
rules:
  - apiGroups: ["mycompany.io"]
    resources: ["databases"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["mycompany.io"]
    resources: ["databases/status"]
    verbs: ["get", "update", "patch"]
  - apiGroups: ["mycompany.io"]
    resources: ["databases/finalizers"]
    verbs: ["update"]
  - apiGroups: ["apps"]
    resources: ["statefulsets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["services", "configmaps", "secrets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["create", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: database-operator-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: database-operator-role
subjects:
  - kind: ServiceAccount
    name: database-operator
    namespace: operators
```

## Operator Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-operator
  namespace: operators
  labels:
    app: database-operator
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database-operator
  template:
    metadata:
      labels:
        app: database-operator
    spec:
      serviceAccountName: database-operator
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: manager
          image: myregistry.io/database-operator:v1.0.0
          args:
            - --leader-elect
            - --health-probe-bind-address=:8081
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop: ["ALL"]
            readOnlyRootFilesystem: true
          ports:
            - containerPort: 8080
              name: metrics
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8081
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8081
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            limits:
              cpu: 500m
              memory: 128Mi
            requests:
              cpu: 10m
              memory: 64Mi
```

## Operator SDK Commands

```bash
# Initialize new operator project
operator-sdk init --domain mycompany.io --repo github.com/mycompany/database-operator

# Create new API (CRD + controller)
operator-sdk create api --group mycompany --version v1 --kind Database --resource --controller

# Generate manifests (CRD, RBAC)
make manifests

# Generate deep copy methods
make generate

# Build operator image
make docker-build docker-push IMG=myregistry.io/database-operator:v1.0.0

# Deploy to cluster
make deploy IMG=myregistry.io/database-operator:v1.0.0

# Undeploy
make undeploy
```

## Best Practices

1. **Use finalizers** for cleanup of external resources before CR deletion
2. **Set owner references** so owned resources are garbage collected with the CR
3. **Implement idempotent reconciliation** - same input should produce same output
4. **Use status subresource** to separate desired state (spec) from observed state (status)
5. **Add validation** via OpenAPI schema or webhooks
6. **Emit events** for significant state changes
7. **Use leader election** for high availability
8. **Set resource limits** on the operator deployment
9. **Follow least privilege** RBAC principles
10. **Test with envtest** for unit testing controllers
````

### `references/gitops.md`

````markdown
# GitOps

---

## GitOps Principles

1. **Declarative** - Entire system described declaratively
2. **Versioned and immutable** - Desired state stored in Git
3. **Pulled automatically** - Agents pull state from Git
4. **Continuously reconciled** - Agents ensure actual matches desired

## ArgoCD Installation

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Install CLI
brew install argocd

# Login
argocd login localhost:8080 --username admin --password <password>

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

## ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/myapp-manifests.git
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
```

## ArgoCD ApplicationSet

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-environments
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: dev
            namespace: development
            revision: develop
          - cluster: staging
            namespace: staging
            revision: main
          - cluster: prod
            namespace: production
            revision: main
  template:
    metadata:
      name: 'myapp-{{cluster}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/myapp-manifests.git
        targetRevision: '{{revision}}'
        path: 'overlays/{{cluster}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

## ArgoCD with Helm

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-helm
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://charts.example.com
    chart: myapp
    targetRevision: 1.2.0
    helm:
      releaseName: myapp
      valueFiles:
        - values-production.yaml
      values: |
        replicaCount: 5
        image:
          tag: v2.0.0
      parameters:
        - name: service.type
          value: LoadBalancer
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

## ArgoCD Project

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production applications
  sourceRepos:
    - 'https://github.com/myorg/*'
    - 'https://charts.example.com'
  destinations:
    - namespace: production
      server: https://kubernetes.default.svc
    - namespace: production-*
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceBlacklist:
    - group: ''
      kind: ResourceQuota
    - group: ''
      kind: LimitRange
  roles:
    - name: developer
      description: Developer access
      policies:
        - p, proj:production:developer, applications, get, production/*, allow
        - p, proj:production:developer, applications, sync, production/*, allow
      groups:
        - developers
```

## Flux Installation

```bash
# Install Flux CLI
brew install fluxcd/tap/flux

# Check prerequisites
flux check --pre

# Bootstrap Flux (GitHub)
flux bootstrap github \
  --owner=myorg \
  --repository=fleet-infra \
  --branch=main \
  --path=clusters/production \
  --personal

# Bootstrap Flux (GitLab)
flux bootstrap gitlab \
  --owner=myorg \
  --repository=fleet-infra \
  --branch=main \
  --path=clusters/production
```

## Flux GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/myorg/myapp-manifests
  ref:
    branch: main
  secretRef:
    name: github-credentials
  ignore: |
    # Exclude files
    .git/
    *.md
```

## Flux Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 10m
  targetNamespace: production
  sourceRef:
    kind: GitRepository
    name: myapp
  path: ./overlays/production
  prune: true
  timeout: 2m
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: myapp
      namespace: production
  postBuild:
    substitute:
      environment: production
      replicas: "5"
    substituteFrom:
      - kind: ConfigMap
        name: cluster-vars
```

## Flux HelmRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: bitnami
  namespace: flux-system
spec:
  interval: 1h
  url: https://charts.bitnami.com/bitnami
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: redis
  namespace: production
spec:
  interval: 5m
  chart:
    spec:
      chart: redis
      version: '17.x'
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  values:
    architecture: standalone
    auth:
      enabled: true
      existingSecret: redis-credentials
    master:
      persistence:
        size: 10Gi
```

## Flux ImageUpdateAutomation

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageRepository
metadata:
  name: myapp
  namespace: flux-system
spec:
  image: myregistry.io/myapp
  interval: 1m
  secretRef:
    name: registry-credentials
---
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImagePolicy
metadata:
  name: myapp
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: myapp
  policy:
    semver:
      range: '>=1.0.0'
---
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: myapp
  namespace: flux-system
spec:
  interval: 1m
  sourceRef:
    kind: GitRepository
    name: myapp
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: fluxcdbot@users.noreply.github.com
        name: fluxcdbot
      messageTemplate: 'Update image to {{.NewTag}}'
    push:
      branch: main
  update:
    path: ./overlays/production
    strategy: Setters
```

## Progressive Delivery with Flagger

```yaml
# Install Flagger
kubectl apply -k github.com/fluxcd/flagger/kustomize/istio

---
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: myapp
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  progressDeadlineSeconds: 600
  service:
    port: 80
    targetPort: 8080
    gateways:
      - myapp-gateway
    hosts:
      - myapp.example.com
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 500
        interval: 1m
    webhooks:
      - name: load-test
        url: http://flagger-loadtester.test/
        timeout: 5s
        metadata:
          cmd: "hey -z 1m -q 10 -c 2 http://myapp-canary.production:80/"
```

## Sealed Secrets

```bash
# Install controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Install kubeseal CLI
brew install kubeseal

# Create sealed secret
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=secret123 \
  --dry-run=client -o yaml | \
  kubeseal --format yaml > sealed-db-credentials.yaml

# Apply sealed secret
kubectl apply -f sealed-db-credentials.yaml
```

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  encryptedData:
    username: AgBy8h...encrypted...
    password: AgCtr2...encrypted...
  template:
    type: Opaque
    metadata:
      labels:
        app: myapp
```

## SOPS with Age

```bash
# Install SOPS
brew install sops

# Generate age key
age-keygen -o age.agekey

# Create SOPS config
cat > .sops.yaml << EOF
creation_rules:
  - path_regex: .*\.enc\.yaml$
    encrypted_regex: ^(data|stringData)$
    age: age1...publickey...
EOF

# Encrypt secret
sops --encrypt --in-place secrets.enc.yaml

# Configure Flux decryption
kubectl create secret generic sops-age \
  --namespace=flux-system \
  --from-file=age.agekey
```

```yaml
# Flux Kustomization with SOPS
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: myapp
  namespace: flux-system
spec:
  decryption:
    provider: sops
    secretRef:
      name: sops-age
  # ... rest of spec
```

## Repository Strategies

### Mono-repo
```
fleet-repo/
├── apps/
│   ├── myapp/
│   │   ├── base/
│   │   └── overlays/
│   └── another-app/
├── infrastructure/
│   ├── cert-manager/
│   └── ingress-nginx/
└── clusters/
    ├── dev/
    ├── staging/
    └── production/
```

### Multi-repo
```
# App repos (one per app)
myapp-manifests/
├── base/
└── overlays/

# Infrastructure repo
infrastructure/
├── cert-manager/
└── ingress-nginx/

# Fleet repo (references others)
fleet-infra/
├── apps.yaml      # Points to app repos
└── infra.yaml     # Points to infra repo
```

## ArgoCD vs Flux Comparison

| Feature | ArgoCD | Flux |
|---------|--------|------|
| UI | Built-in web UI | Third-party (Weave GitOps) |
| Multi-tenancy | AppProject | Namespaced resources |
| Helm | Native support | HelmController |
| Image automation | ArgoCD Image Updater | Native ImagePolicy |
| Notifications | ArgoCD Notifications | Alerts/Receivers |
| RBAC | Built-in | Kubernetes RBAC |
| Architecture | Centralized | Distributed |

## Best Practices

1. **Use separate repos** for app code and manifests
2. **Protect main branch** with required reviews
3. **Use sealed secrets or SOPS** for sensitive data
4. **Enable auto-sync with prune** for drift correction
5. **Set up notifications** for sync failures
6. **Use ApplicationSets/Kustomizations** for multi-environment
7. **Implement progressive delivery** for safe rollouts
8. **Version your Helm charts** semantically
9. **Keep manifests DRY** with Kustomize overlays
10. **Monitor reconciliation metrics** and alerts
````

### `references/helm-charts.md`

````markdown
# Helm Charts

## Chart Structure

```
mychart/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values.schema.json      # Values validation schema
├── charts/                 # Dependency charts
├── templates/              # Template files
│   ├── NOTES.txt          # Post-install notes
│   ├── _helpers.tpl       # Template helpers
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── serviceaccount.yaml
│   ├── hpa.yaml
│   └── tests/
│       └── test-connection.yaml
├── .helmignore            # Ignore patterns
└── README.md              # Chart documentation
```

## Chart.yaml

```yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp on Kubernetes
type: application
version: 1.2.0
appVersion: "2.5.0"

keywords:
  - web
  - application
  - microservice

home: https://example.com
sources:
  - https://github.com/example/myapp

maintainers:
  - name: DevOps Team
    email: devops@example.com
    url: https://example.com/team

icon: https://example.com/logo.png

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
    tags:
      - database

  - name: redis
    version: "17.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
    tags:
      - cache

annotations:
  category: Application
```

## values.yaml

```yaml
# Default values for myapp
replicaCount: 3

image:
  repository: myregistry.io/myapp
  pullPolicy: IfNotPresent
  tag: ""  # Overrides the image tag (default is .Chart.AppVersion)

imagePullSecrets:
  - name: registry-credentials

nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 2000
  seccompProfile:
    type: RuntimeDefault

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true

service:
  type: ClusterIP
  port: 80
  targetPort: 8080
  annotations: {}

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - myapp
          topologyKey: kubernetes.io/hostname

livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2

env:
  - name: ENVIRONMENT
    value: production
  - name: LOG_LEVEL
    value: info

envFrom: []

volumeMounts: []
volumes: []

# PostgreSQL dependency
postgresql:
  enabled: true
  auth:
    username: myapp
    password: ""  # Set via --set or separate secret
    database: myapp
  primary:
    persistence:
      enabled: true
      size: 10Gi

# Redis dependency
redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true
    password: ""
  master:
    persistence:
      enabled: true
      size: 5Gi
```

## templates/_helpers.tpl

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

## templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        {{- with .Values.podAnnotations }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
      - name: {{ .Chart.Name }}
        securityContext:
          {{- toYaml .Values.securityContext | nindent 12 }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.service.targetPort }}
          protocol: TCP
        {{- with .Values.env }}
        env:
          {{- toYaml . | nindent 12 }}
        {{- end }}
        {{- with .Values.envFrom }}
        envFrom:
          {{- toYaml . | nindent 12 }}
        {{- end }}
        livenessProbe:
          {{- toYaml .Values.livenessProbe | nindent 12 }}
        readinessProbe:
          {{- toYaml .Values.readinessProbe | nindent 12 }}
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
        {{- with .Values.volumeMounts }}
        volumeMounts:
          {{- toYaml . | nindent 12 }}
        {{- end }}
      {{- with .Values.volumes }}
      volumes:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

## templates/hpa.yaml

```yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "myapp.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
  {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
  {{- end }}
  {{- if .Values.autoscaling.targetMemoryUtilizationPercentage }}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
  {{- end }}
{{- end }}
```

## Helm Hooks

### Pre-Install Hook (Database Migration)

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migration
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  backoffLimit: 3
  template:
    metadata:
      labels:
        app: migration
    spec:
      restartPolicy: Never
      containers:
      - name: migrate
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        command: ["/app/migrate", "up"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {{ include "myapp.fullname" . }}-secrets
              key: database-url
```

### Post-Install Hook (Test)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ include "myapp.fullname" . }}-test
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  restartPolicy: Never
  containers:
  - name: test
    image: curlimages/curl:latest
    command: ['sh', '-c']
    args:
    - |
      curl -f http://{{ include "myapp.fullname" . }}:{{ .Values.service.port }}/health || exit 1
```

## Helm Commands

```bash
# Create new chart
helm create myapp

# Lint chart
helm lint myapp/

# Template rendering (dry-run)
helm template myapp ./myapp -f values-prod.yaml

# Install chart
helm install myapp ./myapp \
  --namespace production \
  --create-namespace \
  --values values-prod.yaml \
  --set image.tag=v1.2.0

# Upgrade chart
helm upgrade myapp ./myapp \
  --namespace production \
  --values values-prod.yaml \
  --set image.tag=v1.3.0 \
  --atomic \
  --timeout 5m

# Rollback
helm rollback myapp 1 --namespace production

# List releases
helm list --namespace production

# Get values
helm get values myapp --namespace production

# Get manifest
helm get manifest myapp --namespace production

# Uninstall
helm uninstall myapp --namespace production

# Test
helm test myapp --namespace production

# Package chart
helm package myapp/ --version 1.2.0

# Dependency update
helm dependency update myapp/
```

## values-prod.yaml (Environment Override)

```yaml
replicaCount: 5

image:
  tag: v1.2.0

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 20

ingress:
  hosts:
    - host: app.production.example.com
      paths:
        - path: /
          pathType: Prefix

postgresql:
  enabled: true
  primary:
    persistence:
      size: 100Gi
    resources:
      limits:
        cpu: 2000m
        memory: 4Gi
      requests:
        cpu: 500m
        memory: 1Gi

redis:
  enabled: true
  master:
    persistence:
      size: 20Gi
```

## Chart Testing

### Helm Test Command

```bash
# Run chart tests after installation
helm test myapp --namespace production

# Run tests with logs
helm test myapp --namespace production --logs

# Run tests with timeout
helm test myapp --namespace production --timeout 5m
```

### Chart Testing Tool (ct)

```bash
# Install chart-testing
brew install chart-testing

# Lint charts
ct lint --config ct.yaml

# Lint and install (CI/CD)
ct lint-and-install --config ct.yaml

# Test changed charts only
ct lint-and-install --target-branch main --config ct.yaml
```

```yaml
# ct.yaml - Chart Testing configuration
remote: origin
target-branch: main
chart-dirs:
  - charts
chart-repos:
  - bitnami=https://charts.bitnami.com/bitnami
helm-extra-args: --timeout 600s
validate-maintainers: true
check-version-increment: true
```

### Unit Testing with helm-unittest

```bash
# Install plugin
helm plugin install https://github.com/helm-unittest/helm-unittest

# Run tests
helm unittest ./mychart
```

```yaml
# tests/deployment_test.yaml
suite: deployment tests
templates:
  - templates/deployment.yaml
tests:
  - it: should create deployment with correct replicas
    set:
      replicaCount: 5
    asserts:
      - isKind:
          of: Deployment
      - equal:
          path: spec.replicas
          value: 5

  - it: should set resource limits
    set:
      resources:
        limits:
          cpu: 500m
          memory: 256Mi
    asserts:
      - equal:
          path: spec.template.spec.containers[0].resources.limits.cpu
          value: 500m

  - it: should not create HPA when autoscaling disabled
    set:
      autoscaling:
        enabled: false
    template: templates/hpa.yaml
    asserts:
      - hasDocuments:
          count: 0
```

## Values Schema Validation

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["image", "service"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "default": 1
    },
    "image": {
      "type": "object",
      "required": ["repository"],
      "properties": {
        "repository": {
          "type": "string",
          "pattern": "^[a-z0-9.-/]+$"
        },
        "tag": {
          "type": "string"
        },
        "pullPolicy": {
          "type": "string",
          "enum": ["Always", "IfNotPresent", "Never"]
        }
      }
    },
    "service": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["ClusterIP", "NodePort", "LoadBalancer"]
        },
        "port": {
          "type": "integer",
          "minimum": 1,
          "maximum": 65535
        }
      }
    },
    "resources": {
      "type": "object",
      "properties": {
        "limits": {
          "$ref": "#/definitions/resourceRequirements"
        },
        "requests": {
          "$ref": "#/definitions/resourceRequirements"
        }
      }
    }
  },
  "definitions": {
    "resourceRequirements": {
      "type": "object",
      "properties": {
        "cpu": {
          "type": "string",
          "pattern": "^[0-9]+m?$"
        },
        "memory": {
          "type": "string",
          "pattern": "^[0-9]+(Mi|Gi)$"
        }
      }
    }
  }
}
```

## Chart Repository

### Create Repository

```bash
# Package chart
helm package mychart/ --version 1.2.0 --destination ./repo

# Generate index
helm repo index ./repo --url https://charts.example.com

# Update index with new chart
helm repo index ./repo --url https://charts.example.com --merge ./repo/index.yaml
```

### GitHub Pages Repository

```yaml
# .github/workflows/release.yaml
name: Release Charts
on:
  push:
    branches: [main]
    paths: ['charts/**']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Configure Git
        run: |
          git config user.name "$GITHUB_ACTOR"
          git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
      - name: Install Helm
        uses: azure/setup-helm@v3
      - name: Run chart-releaser
        uses: helm/chart-releaser-action@v1.6.0
        env:
          CR_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```

### OCI Registry

```bash
# Login to registry
helm registry login myregistry.io -u user -p token

# Push chart to OCI registry
helm push mychart-1.2.0.tgz oci://myregistry.io/charts

# Pull from OCI
helm pull oci://myregistry.io/charts/mychart --version 1.2.0

# Install from OCI
helm install myapp oci://myregistry.io/charts/mychart --version 1.2.0
```

## Helm Plugins

```bash
# helm-diff - preview upgrades
helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade myapp ./mychart -f values-prod.yaml

# helm-secrets - manage encrypted secrets
helm plugin install https://github.com/jkroepke/helm-secrets
helm secrets encrypt secrets.yaml
helm secrets decrypt secrets.yaml.enc
helm secrets install myapp ./mychart -f secrets.yaml.enc

# helm-git - use git repos as chart sources
helm plugin install https://github.com/aslafy-z/helm-git
helm repo add mycharts git+https://github.com/myorg/charts@charts?ref=main

# helm-s3 - S3 as chart repository
helm plugin install https://github.com/hypnoglow/helm-s3
helm s3 init s3://my-bucket/charts
helm s3 push mychart-1.2.0.tgz my-s3-repo
```

## Complex Upgrade/Rollback

```bash
# Upgrade with atomic (rollback on failure)
helm upgrade myapp ./mychart \
  --namespace production \
  --atomic \
  --timeout 10m \
  --wait

# Upgrade with cleanup on failure
helm upgrade myapp ./mychart \
  --namespace production \
  --cleanup-on-fail

# Force resource update (recreate)
helm upgrade myapp ./mychart \
  --namespace production \
  --force

# Dry run before upgrade
helm upgrade myapp ./mychart \
  --namespace production \
  --dry-run \
  --debug

# Compare current vs new
helm get manifest myapp -n production > current.yaml
helm template myapp ./mychart -f values-prod.yaml > new.yaml
diff current.yaml new.yaml

# Rollback to specific revision
helm rollback myapp 3 --namespace production

# Rollback with wait
helm rollback myapp 3 --namespace production --wait --timeout 5m

# View revision history
helm history myapp --namespace production
```

## Library Charts

```yaml
# Chart.yaml for library chart
apiVersion: v2
name: mylib
type: library
version: 1.0.0
```

```yaml
# templates/_deployment.tpl in library
{{- define "mylib.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mylib.fullname" . }}
  labels:
    {{- include "mylib.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mylib.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mylib.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
{{- end }}
```

```yaml
# Using library chart
# Chart.yaml
dependencies:
  - name: mylib
    version: "1.x.x"
    repository: https://charts.example.com

# templates/deployment.yaml
{{- include "mylib.deployment" . }}
```

## Best Practices

1. **Versioning**: Follow semantic versioning for charts
2. **Values**: Provide sensible defaults, allow overrides
3. **Documentation**: Document all values in README
4. **Testing**: Include tests in templates/tests/
5. **Helpers**: Use _helpers.tpl for reusable templates
6. **Labels**: Include standard Kubernetes labels
7. **Annotations**: Use annotations for metadata and tools
8. **Hooks**: Use hooks for migrations, cleanup
9. **Dependencies**: Pin dependency versions
10. **Schema**: Validate values with values.schema.json
11. **Use ct** for comprehensive chart testing in CI
12. **Use helm-diff** before production upgrades
13. **Encrypt secrets** with helm-secrets or sealed-secrets
14. **Use library charts** for shared patterns
15. **Push to OCI registries** for better artifact management
````

### `references/multi-cluster.md`

````markdown
# Multi-Cluster Management

---

## Cluster API

### Installation

```bash
# Install clusterctl CLI
curl -L https://github.com/kubernetes-sigs/cluster-api/releases/download/v1.6.0/clusterctl-linux-amd64 -o clusterctl
chmod +x clusterctl && sudo mv clusterctl /usr/local/bin/

# Initialize management cluster with AWS provider
clusterctl init --infrastructure aws

# Initialize with multiple providers
clusterctl init \
  --infrastructure aws,azure \
  --control-plane kubeadm \
  --bootstrap kubeadm
```

### Cluster Definition

```yaml
apiVersion: cluster.x-k8s.io/v1beta1
kind: Cluster
metadata:
  name: production-cluster
  namespace: clusters
spec:
  clusterNetwork:
    pods:
      cidrBlocks: ["192.168.0.0/16"]
    services:
      cidrBlocks: ["10.96.0.0/12"]
  controlPlaneRef:
    apiVersion: controlplane.cluster.x-k8s.io/v1beta1
    kind: KubeadmControlPlane
    name: production-control-plane
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
    kind: AWSCluster
    name: production-cluster
---
apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
kind: AWSCluster
metadata:
  name: production-cluster
  namespace: clusters
spec:
  region: us-west-2
  sshKeyName: production-key
  network:
    vpc:
      cidrBlock: 10.0.0.0/16
    subnets:
      - availabilityZone: us-west-2a
        cidrBlock: 10.0.1.0/24
        isPublic: true
      - availabilityZone: us-west-2b
        cidrBlock: 10.0.2.0/24
        isPublic: true
```

### Control Plane

```yaml
apiVersion: controlplane.cluster.x-k8s.io/v1beta1
kind: KubeadmControlPlane
metadata:
  name: production-control-plane
  namespace: clusters
spec:
  replicas: 3
  version: v1.28.0
  machineTemplate:
    infrastructureRef:
      apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
      kind: AWSMachineTemplate
      name: production-control-plane
  kubeadmConfigSpec:
    clusterConfiguration:
      apiServer:
        extraArgs:
          cloud-provider: aws
      controllerManager:
        extraArgs:
          cloud-provider: aws
    initConfiguration:
      nodeRegistration:
        kubeletExtraArgs:
          cloud-provider: aws
    joinConfiguration:
      nodeRegistration:
        kubeletExtraArgs:
          cloud-provider: aws
```

### Machine Deployment (Worker Nodes)

```yaml
apiVersion: cluster.x-k8s.io/v1beta1
kind: MachineDeployment
metadata:
  name: production-workers
  namespace: clusters
spec:
  clusterName: production-cluster
  replicas: 5
  selector:
    matchLabels:
      cluster.x-k8s.io/cluster-name: production-cluster
  template:
    spec:
      clusterName: production-cluster
      version: v1.28.0
      bootstrap:
        configRef:
          apiVersion: bootstrap.cluster.x-k8s.io/v1beta1
          kind: KubeadmConfigTemplate
          name: production-workers
      infrastructureRef:
        apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
        kind: AWSMachineTemplate
        name: production-workers
---
apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
kind: AWSMachineTemplate
metadata:
  name: production-workers
  namespace: clusters
spec:
  template:
    spec:
      instanceType: m5.xlarge
      iamInstanceProfile: nodes.cluster-api-provider-aws.sigs.k8s.io
      sshKeyName: production-key
      rootVolume:
        size: 100
        type: gp3
```

## Cross-Cluster Networking

### Submariner Installation

```bash
# Install subctl
curl -Ls https://get.submariner.io | bash

# Join clusters to broker
subctl deploy-broker --kubeconfig kubeconfig-cluster1

# Join workload clusters
subctl join --kubeconfig kubeconfig-cluster1 broker-info.subm --clusterid cluster1
subctl join --kubeconfig kubeconfig-cluster2 broker-info.subm --clusterid cluster2

# Verify connectivity
subctl show all
```

### ServiceExport/ServiceImport

```yaml
# Export service from cluster1
apiVersion: multicluster.x-k8s.io/v1alpha1
kind: ServiceExport
metadata:
  name: myapp
  namespace: production
---
# Service is auto-imported to other clusters as:
# myapp.production.svc.clusterset.local
```

### Cilium Cluster Mesh

```bash
# Enable cluster mesh on both clusters
cilium clustermesh enable --context cluster1
cilium clustermesh enable --context cluster2

# Connect clusters
cilium clustermesh connect --context cluster1 --destination-context cluster2

# Verify
cilium clustermesh status --context cluster1
```

```yaml
# Global service accessible from all clusters
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: production
  annotations:
    service.cilium.io/global: "true"
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - port: 80
```

## Multi-Cluster DNS

### ExternalDNS with Route53

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: external-dns
  namespace: kube-system
spec:
  template:
    spec:
      containers:
        - name: external-dns
          image: k8s.gcr.io/external-dns/external-dns:v0.14.0
          args:
            - --source=service
            - --source=ingress
            - --provider=aws
            - --aws-zone-type=public
            - --registry=txt
            - --txt-owner-id=my-cluster
            - --domain-filter=example.com
```

### CoreDNS Federation

```yaml
# Forward queries for other clusters
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
        }
        # Forward to cluster2 DNS
        cluster2.local:53 {
            forward . 10.0.0.10
        }
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
    }
```

## Workload Distribution

### Kubernetes Federation v2

```yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedDeployment
metadata:
  name: myapp
  namespace: production
spec:
  template:
    metadata:
      labels:
        app: myapp
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: myapp
      template:
        metadata:
          labels:
            app: myapp
        spec:
          containers:
            - name: myapp
              image: myregistry.io/myapp:v1.0.0
  placement:
    clusters:
      - name: cluster-us-west
      - name: cluster-us-east
      - name: cluster-eu-west
  overrides:
    - clusterName: cluster-us-west
      clusterOverrides:
        - path: "/spec/replicas"
          value: 5
    - clusterName: cluster-eu-west
      clusterOverrides:
        - path: "/spec/replicas"
          value: 3
```

### ArgoCD Multi-Cluster

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-global
  namespace: argocd
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            environment: production
  template:
    metadata:
      name: 'myapp-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/myapp-manifests.git
        targetRevision: main
        path: overlays/production
      destination:
        server: '{{server}}'
        namespace: production
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

## Disaster Recovery

### Velero Backup Configuration

```bash
# Install Velero with S3
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket velero-backups \
  --backup-location-config region=us-west-2 \
  --snapshot-location-config region=us-west-2 \
  --secret-file ./credentials-velero
```

```yaml
# Scheduled backup
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
      - production
      - staging
    excludedResources:
      - events
    storageLocation: default
    volumeSnapshotLocations:
      - default
    ttl: 720h  # 30 days
---
# Restore to different cluster
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: restore-production
  namespace: velero
spec:
  backupName: daily-backup-20240115
  includedNamespaces:
    - production
  restorePVs: true
  preserveNodePorts: true
```

### Active-Passive Failover

```yaml
# Primary cluster ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  annotations:
    external-dns.alpha.kubernetes.io/hostname: myapp.example.com
    external-dns.alpha.kubernetes.io/set-identifier: primary
    external-dns.alpha.kubernetes.io/aws-weight: "100"
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp
                port:
                  number: 80
---
# Secondary cluster ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  annotations:
    external-dns.alpha.kubernetes.io/hostname: myapp.example.com
    external-dns.alpha.kubernetes.io/set-identifier: secondary
    external-dns.alpha.kubernetes.io/aws-weight: "0"
spec:
  rules:
    - host: myapp.example.com
      # ... same backend config
```

## Centralized Management Tools

### Rancher Setup

```bash
# Install Rancher with Helm
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --create-namespace \
  --set hostname=rancher.example.com \
  --set bootstrapPassword=admin
```

### Kubeconfig Management

```yaml
# Merge multiple kubeconfigs
# ~/.kube/config
apiVersion: v1
kind: Config
clusters:
  - name: cluster-us-west
    cluster:
      server: https://cluster-us-west.example.com
      certificate-authority-data: ...
  - name: cluster-us-east
    cluster:
      server: https://cluster-us-east.example.com
      certificate-authority-data: ...
contexts:
  - name: us-west
    context:
      cluster: cluster-us-west
      user: admin-us-west
      namespace: default
  - name: us-east
    context:
      cluster: cluster-us-east
      user: admin-us-east
      namespace: default
users:
  - name: admin-us-west
    user:
      token: ...
  - name: admin-us-east
    user:
      token: ...
current-context: us-west
```

```bash
# Switch between clusters
kubectl config use-context us-west
kubectl config use-context us-east

# Run command against specific cluster
kubectl --context=us-west get pods
kubectl --context=us-east get pods

# Use kubectx for easier switching
kubectx us-west
```

## Best Practices

1. **Use Cluster API** for declarative cluster lifecycle management
2. **Implement service mesh** for secure cross-cluster communication
3. **Set up DNS-based routing** for global service discovery
4. **Configure automated backups** with Velero across clusters
5. **Use GitOps** (ArgoCD/Flux) for consistent multi-cluster deployments
6. **Implement network policies** consistently across clusters
7. **Centralize observability** with cross-cluster metrics and logs
8. **Test failover procedures** regularly
9. **Use namespaces consistently** across clusters
10. **Document cluster topology** and dependencies
11. **Implement RBAC** with cross-cluster access patterns
12. **Monitor cluster health** from centralized dashboard
````

### `references/networking.md`

````markdown
# Kubernetes Networking

## Service Types

### ClusterIP (Default)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: production
  labels:
    app: web-app
spec:
  type: ClusterIP
  selector:
    app: web-app
    tier: frontend
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: metrics
    protocol: TCP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
```

### Headless Service (StatefulSet)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
  namespace: database
spec:
  clusterIP: None  # Headless
  selector:
    app: postgres
  ports:
  - name: postgres
    port: 5432
    targetPort: 5432
```

### NodePort

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-app
  namespace: production
spec:
  type: NodePort
  selector:
    app: external-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
    nodePort: 30080  # Range: 30000-32767
    protocol: TCP
```

### LoadBalancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: public-web
  namespace: production
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-internal: "false"
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
  loadBalancerSourceRanges:
  - 203.0.113.0/24  # Restrict source IPs
```

## Ingress Resources

### NGINX Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - www.example.com
    - api.example.com
    secretName: example-tls
  rules:
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2-service
            port:
              number: 8080
```

### Path-Based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: production
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-api
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## NetworkPolicy (Zero Trust)

### Default Deny All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### Allow Frontend to Backend

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: frontend
    ports:
    - protocol: TCP
      port: 8080
```

### Backend to Database

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-to-database
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: backend
    - namespaceSelector:
        matchLabels:
          name: production
    ports:
    - protocol: TCP
      port: 5432
```

### Allow DNS and External HTTPS

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-and-https
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

### Cross-Namespace Communication

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-monitoring
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
      podSelector:
        matchLabels:
          app: prometheus
    ports:
    - protocol: TCP
      port: 8080
```

## DNS Configuration

### Service DNS Names

```yaml
# Within same namespace
http://web-app-service

# Cross-namespace
http://web-app-service.production.svc.cluster.local

# Headless service (StatefulSet)
postgres-0.postgres-headless.database.svc.cluster.local
postgres-1.postgres-headless.database.svc.cluster.local
postgres-2.postgres-headless.database.svc.cluster.local
```

### Custom DNS Policy

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns
spec:
  dnsPolicy: None
  dnsConfig:
    nameservers:
    - 8.8.8.8
    - 8.8.4.4
    searches:
    - production.svc.cluster.local
    - svc.cluster.local
    - cluster.local
    options:
    - name: ndots
      value: "2"
  containers:
  - name: app
    image: myapp:latest
```

## Service Mesh (Istio Example)

### VirtualService

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: web-app-routes
  namespace: production
spec:
  hosts:
  - web-app-service
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: web-app-service
        subset: v2
  - route:
    - destination:
        host: web-app-service
        subset: v1
      weight: 90
    - destination:
        host: web-app-service
        subset: v2
      weight: 10
```

### DestinationRule

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: web-app-destination
  namespace: production
spec:
  host: web-app-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
    loadBalancer:
      simple: LEAST_REQUEST
  subsets:
  - name: v1
    labels:
      version: v1.0.0
  - name: v2
    labels:
      version: v2.0.0
```

## EndpointSlice (Modern Alternative to Endpoints)

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: web-app-abc123
  namespace: production
  labels:
    kubernetes.io/service-name: web-app-service
addressType: IPv4
ports:
- name: http
  protocol: TCP
  port: 8080
endpoints:
- addresses:
  - "10.244.1.5"
  conditions:
    ready: true
  nodeName: node-1
- addresses:
  - "10.244.2.7"
  conditions:
    ready: true
  nodeName: node-2
```

## Best Practices

1. **Default Deny**: Start with deny-all NetworkPolicy, then allow specific traffic
2. **Least Privilege**: Only open required ports and protocols
3. **Service Selection**: Use ClusterIP by default, LoadBalancer sparingly
4. **DNS Names**: Use service DNS names, avoid hardcoded IPs
5. **TLS Termination**: Terminate TLS at Ingress when possible
6. **Health Checks**: Configure proper health check paths
7. **Rate Limiting**: Apply rate limits at Ingress level
8. **Monitoring**: Expose metrics endpoints for Prometheus
````

### `references/service-mesh.md`

````markdown
# Service Mesh

---

## Istio Installation

```bash
# Install Istio CLI
curl -L https://istio.io/downloadIstio | sh -
export PATH=$PWD/istio-*/bin:$PATH

# Install Istio with default profile
istioctl install --set profile=default -y

# Enable sidecar injection for namespace
kubectl label namespace production istio-injection=enabled

# Verify installation
istioctl verify-install
kubectl get pods -n istio-system
```

## Istio Profiles

```bash
# Minimal - only control plane
istioctl install --set profile=minimal

# Default - control plane + ingress gateway
istioctl install --set profile=default

# Demo - includes egress gateway, extra features
istioctl install --set profile=demo

# Production - tuned for production
istioctl install --set profile=default \
  --set values.global.proxy.resources.requests.cpu=100m \
  --set values.global.proxy.resources.requests.memory=128Mi \
  --set values.global.proxy.resources.limits.cpu=500m \
  --set values.global.proxy.resources.limits.memory=256Mi
```

## VirtualService

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
  namespace: production
spec:
  hosts:
    - myapp
    - myapp.example.com
  gateways:
    - mesh                    # Internal mesh traffic
    - myapp-gateway           # External gateway
  http:
    # Route based on headers
    - match:
        - headers:
            x-version:
              exact: "v2"
      route:
        - destination:
            host: myapp
            subset: v2

    # Canary release (90/10 split)
    - match:
        - uri:
            prefix: /api
      route:
        - destination:
            host: myapp
            subset: v1
          weight: 90
        - destination:
            host: myapp
            subset: v2
          weight: 10

    # Default route
    - route:
        - destination:
            host: myapp
            subset: v1
      timeout: 30s
      retries:
        attempts: 3
        perTryTimeout: 10s
        retryOn: connect-failure,refused-stream,503
```

## DestinationRule

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: myapp
  namespace: production
spec:
  host: myapp
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
        connectTimeout: 5s
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
        maxRequestsPerConnection: 100
    loadBalancer:
      simple: LEAST_REQUEST
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
    - name: v1
      labels:
        version: v1
      trafficPolicy:
        loadBalancer:
          simple: ROUND_ROBIN
    - name: v2
      labels:
        version: v2
```

## Gateway

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: myapp-gateway
  namespace: production
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - myapp.example.com
      tls:
        httpsRedirect: true
    - port:
        number: 443
        name: https
        protocol: HTTPS
      hosts:
        - myapp.example.com
      tls:
        mode: SIMPLE
        credentialName: myapp-tls-secret
```

## Traffic Mirroring (Shadow Traffic)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp-mirror
  namespace: production
spec:
  hosts:
    - myapp
  http:
    - route:
        - destination:
            host: myapp
            subset: v1
      mirror:
        host: myapp
        subset: v2
      mirrorPercentage:
        value: 100.0
```

## mTLS Configuration

```yaml
# Strict mTLS for namespace
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
---
# Per-workload mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: legacy-service
  namespace: production
spec:
  selector:
    matchLabels:
      app: legacy-service
  mtls:
    mode: PERMISSIVE  # Allow both mTLS and plaintext
---
# Mesh-wide mTLS policy
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
```

## Authorization Policy

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: myapp-authz
  namespace: production
spec:
  selector:
    matchLabels:
      app: myapp
  action: ALLOW
  rules:
    # Allow from specific service accounts
    - from:
        - source:
            principals:
              - "cluster.local/ns/production/sa/frontend"
              - "cluster.local/ns/production/sa/api-gateway"
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/*"]

    # Allow health checks from anywhere
    - to:
        - operation:
            methods: ["GET"]
            paths: ["/health", "/ready"]

    # Deny all other traffic (implicit deny when rules exist)
```

## Circuit Breaker

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: myapp-circuit-breaker
  namespace: production
spec:
  host: myapp
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 50
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 100
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 100
      minHealthPercent: 0
```

## Fault Injection (Testing)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp-fault
  namespace: production
spec:
  hosts:
    - myapp
  http:
    - match:
        - headers:
            x-test-fault:
              exact: "inject"
      fault:
        delay:
          percentage:
            value: 50
          fixedDelay: 5s
        abort:
          percentage:
            value: 10
          httpStatus: 503
      route:
        - destination:
            host: myapp
    - route:
        - destination:
            host: myapp
```

## Linkerd Installation

```bash
# Install Linkerd CLI
curl --proto '=https' --tlsv1.2 -sSfL https://run.linkerd.io/install | sh
export PATH=$HOME/.linkerd2/bin:$PATH

# Validate cluster
linkerd check --pre

# Install CRDs
linkerd install --crds | kubectl apply -f -

# Install control plane
linkerd install | kubectl apply -f -

# Check installation
linkerd check

# Enable injection for namespace
kubectl annotate namespace production linkerd.io/inject=enabled

# Inject existing deployments
kubectl get deploy -n production -o yaml | linkerd inject - | kubectl apply -f -
```

## Linkerd Service Profile

```yaml
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: myapp.production.svc.cluster.local
  namespace: production
spec:
  routes:
    - name: GET /api/users
      condition:
        method: GET
        pathRegex: /api/users
      responseClasses:
        - condition:
            status:
              min: 500
              max: 599
          isFailure: true
      timeout: 5s

    - name: POST /api/orders
      condition:
        method: POST
        pathRegex: /api/orders
      isRetryable: true
      timeout: 10s

  retryBudget:
    retryRatio: 0.2
    minRetriesPerSecond: 10
    ttl: 10s
```

## Linkerd Traffic Split (Canary)

```yaml
apiVersion: split.smi-spec.io/v1alpha1
kind: TrafficSplit
metadata:
  name: myapp-canary
  namespace: production
spec:
  service: myapp
  backends:
    - service: myapp-v1
      weight: 900m    # 90%
    - service: myapp-v2
      weight: 100m    # 10%
```

## Multi-Cluster Mesh (Istio)

```yaml
# Primary cluster - create remote secret
istioctl x create-remote-secret \
  --context=cluster1 \
  --name=cluster1 | kubectl apply -f - --context=cluster2

# Enable endpoint discovery
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  values:
    global:
      meshID: mesh1
      multiCluster:
        clusterName: cluster1
      network: network1
```

## Kiali Dashboard

```bash
# Install Kiali
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml

# Access dashboard
istioctl dashboard kiali
```

## Jaeger Tracing

```bash
# Install Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Access dashboard
istioctl dashboard jaeger
```

## Service Mesh Comparison

| Feature | Istio | Linkerd |
|---------|-------|---------|
| Sidecar | Envoy | linkerd2-proxy (Rust) |
| Resource usage | Higher | Lower |
| Features | More extensive | Focused/simpler |
| mTLS | Built-in | Built-in |
| Traffic management | Advanced | Basic (SMI) |
| Multi-cluster | Native support | Requires setup |
| Learning curve | Steeper | Gentler |

## Best Practices

1. **Start with permissive mTLS**, migrate to strict gradually
2. **Use circuit breakers** to prevent cascade failures
3. **Set reasonable timeouts** and retry budgets
4. **Enable distributed tracing** for observability
5. **Test with fault injection** before production
6. **Monitor sidecar resource usage** and tune accordingly
7. **Use traffic mirroring** to validate new versions safely
8. **Implement authorization policies** for zero-trust
9. **Keep service mesh version updated** for security patches
10. **Document traffic routing decisions** in VirtualServices
````

### `references/storage.md`

````markdown
# Kubernetes Storage

## StorageClass Definitions

### AWS EBS (gp3)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
  kmsKeyId: "arn:aws:kms:us-east-1:123456789012:key/..."
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
reclaimPolicy: Delete
```

### GCE Persistent Disk (SSD)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd-gce
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-ssd
  replication-type: regional-pd
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
reclaimPolicy: Delete
```

### Azure Disk (Premium SSD)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd-azure
provisioner: disk.csi.azure.com
parameters:
  storageaccounttype: Premium_LRS
  kind: Managed
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
reclaimPolicy: Delete
```

### NFS Storage

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-storage
provisioner: nfs.csi.k8s.io
parameters:
  server: nfs-server.example.com
  share: /exports/kubernetes
volumeBindingMode: Immediate
reclaimPolicy: Retain
```

## PersistentVolume (Static Provisioning)

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: legacy-database-pv
  labels:
    type: local
    app: legacy-db
spec:
  capacity:
    storage: 100Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/legacy-db
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - node-01
```

## PersistentVolumeClaim Patterns

### Basic PVC (Dynamic Provisioning)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-pvc
  namespace: production
  labels:
    app: postgres
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 50Gi
```

### Shared Storage (ReadWriteMany)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-assets
  namespace: production
spec:
  accessModes:
  - ReadWriteMany
  storageClassName: nfs-storage
  resources:
    requests:
      storage: 100Gi
```

### Block Volume

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: block-storage
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce
  volumeMode: Block
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 10Gi
```

## Using PVCs in Pods

### Single PVC Mount

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: database-pod
spec:
  containers:
  - name: postgres
    image: postgres:15
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: database-pvc
```

### Multiple PVCs

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: data
      mountPath: /data
    - name: logs
      mountPath: /var/log/app
    - name: shared
      mountPath: /shared
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: app-data-pvc
  - name: logs
    persistentVolumeClaim:
      claimName: app-logs-pvc
  - name: shared
    persistentVolumeClaim:
      claimName: shared-assets
```

## StatefulSet with VolumeClaimTemplates

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-cluster
  namespace: database
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        - name: config
          mountPath: /etc/postgresql
      volumes:
      - name: config
        configMap:
          name: postgres-config
  volumeClaimTemplates:
  - metadata:
      name: data
      labels:
        app: postgres
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 50Gi
```

## Volume Snapshots

### VolumeSnapshotClass

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-snapclass
driver: ebs.csi.aws.com
deletionPolicy: Delete
parameters:
  encrypted: "true"
```

### VolumeSnapshot

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: database-snapshot-20231214
  namespace: production
spec:
  volumeSnapshotClassName: csi-snapclass
  source:
    persistentVolumeClaimName: database-pvc
```

### Restore from Snapshot

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-restored
  namespace: production
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd
  dataSource:
    name: database-snapshot-20231214
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  resources:
    requests:
      storage: 50Gi
```

## Volume Expansion

```yaml
# 1. Ensure StorageClass allows expansion
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
allowVolumeExpansion: true
# ... rest of config

---
# 2. Expand PVC by updating size
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 100Gi  # Increased from 50Gi
```

## EmptyDir Volumes

### Memory-Backed EmptyDir

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cache-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: cache
      mountPath: /cache
  volumes:
  - name: cache
    emptyDir:
      medium: Memory
      sizeLimit: 1Gi
```

### Disk-Backed EmptyDir

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: worker-pod
spec:
  containers:
  - name: worker
    image: worker:latest
    volumeMounts:
    - name: scratch
      mountPath: /tmp/scratch
  volumes:
  - name: scratch
    emptyDir:
      sizeLimit: 10Gi
```

## ConfigMap and Secret Volumes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: config
      mountPath: /etc/config
      readOnly: true
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
      items:
      - key: app.yaml
        path: config.yaml
        mode: 0644
  - name: secrets
    secret:
      secretName: app-secrets
      defaultMode: 0400
      items:
      - key: db-password
        path: database/password
```

## Projected Volumes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: projected-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: combined
      mountPath: /combined
      readOnly: true
  volumes:
  - name: combined
    projected:
      sources:
      - secret:
          name: app-secrets
          items:
          - key: password
            path: secrets/password
      - configMap:
          name: app-config
          items:
          - key: config.yaml
            path: config/app.yaml
      - downwardAPI:
          items:
          - path: pod/labels
            fieldRef:
              fieldPath: metadata.labels
          - path: pod/annotations
            fieldRef:
              fieldPath: metadata.annotations
```

## CSI Driver Examples

### AWS EBS CSI Driver

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    csi:
      driver: ebs.csi.aws.com
      volumeAttributes:
        type: gp3
        iops: "3000"
        encrypted: "true"
```

### Secrets Store CSI Driver

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secrets-pod
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: secrets-store
      mountPath: /mnt/secrets
      readOnly: true
  volumes:
  - name: secrets-store
    csi:
      driver: secrets-store.csi.k8s.io
      readOnly: true
      volumeAttributes:
        secretProviderClass: aws-secrets
```

## HostPath Volumes (Use with Caution)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: privileged-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: host-data
      mountPath: /host-data
    securityContext:
      privileged: true
  volumes:
  - name: host-data
    hostPath:
      path: /data
      type: DirectoryOrCreate
```

## Best Practices

1. **Dynamic Provisioning**: Prefer dynamic provisioning with StorageClasses
2. **Access Modes**: Use correct access mode (RWO for single node, RWX for multi-node)
3. **Reclaim Policy**: Use Retain for critical data, Delete for temporary
4. **Backup**: Regular snapshots and offsite backups
5. **Monitoring**: Monitor disk usage and performance metrics
6. **Expansion**: Enable volume expansion in StorageClass
7. **Performance**: Choose appropriate storage type for workload
8. **Security**: Encrypt volumes at rest and in transit
9. **Limits**: Set size limits on emptyDir volumes
10. **Labels**: Label PVCs for organization and backup policies
````

### `references/troubleshooting.md`

````markdown
# Kubernetes Troubleshooting

## Essential kubectl Commands

### Pod Inspection

```bash
# Get pods with details
kubectl get pods -n production -o wide
kubectl get pods --all-namespaces
kubectl get pods --field-selector status.phase=Running
kubectl get pods --selector app=web-app

# Describe pod (shows events)
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production

# Get pod logs
kubectl logs web-app-7d5c8b9f4-xk2pm -n production
kubectl logs web-app-7d5c8b9f4-xk2pm -n production --previous  # Previous container
kubectl logs web-app-7d5c8b9f4-xk2pm -n production -c init-container
kubectl logs -f web-app-7d5c8b9f4-xk2pm -n production  # Follow logs
kubectl logs --tail=100 web-app-7d5c8b9f4-xk2pm -n production
kubectl logs --since=1h web-app-7d5c8b9f4-xk2pm -n production

# Get all pod logs from deployment
kubectl logs deployment/web-app -n production --all-containers=true

# Execute commands in pod
kubectl exec -it web-app-7d5c8b9f4-xk2pm -n production -- /bin/sh
kubectl exec web-app-7d5c8b9f4-xk2pm -n production -- env
kubectl exec web-app-7d5c8b9f4-xk2pm -n production -- cat /etc/config/app.yaml

# Copy files to/from pod
kubectl cp web-app-7d5c8b9f4-xk2pm:/app/logs/app.log ./app.log -n production
kubectl cp ./config.yaml web-app-7d5c8b9f4-xk2pm:/tmp/config.yaml -n production

# Port forward
kubectl port-forward web-app-7d5c8b9f4-xk2pm 8080:8080 -n production
kubectl port-forward service/web-app 8080:80 -n production
```

### Deployment Debugging

```bash
# Check deployment status
kubectl get deployment web-app -n production
kubectl describe deployment web-app -n production
kubectl rollout status deployment/web-app -n production
kubectl rollout history deployment/web-app -n production

# Check replica sets
kubectl get rs -n production
kubectl describe rs web-app-7d5c8b9f4 -n production

# Scale deployment
kubectl scale deployment web-app --replicas=5 -n production

# Rollback deployment
kubectl rollout undo deployment/web-app -n production
kubectl rollout undo deployment/web-app --to-revision=2 -n production

# Restart deployment (recreate pods)
kubectl rollout restart deployment/web-app -n production
```

### Service and Network Debugging

```bash
# Get services
kubectl get svc -n production
kubectl describe svc web-app -n production

# Get endpoints
kubectl get endpoints web-app -n production
kubectl describe endpoints web-app -n production

# Get ingress
kubectl get ingress -n production
kubectl describe ingress web-app -n production

# Get network policies
kubectl get networkpolicy -n production
kubectl describe networkpolicy frontend-to-backend -n production
```

### Resource and Configuration

```bash
# Get ConfigMaps and Secrets
kubectl get configmap -n production
kubectl describe configmap app-config -n production
kubectl get configmap app-config -n production -o yaml

kubectl get secret -n production
kubectl describe secret app-secrets -n production
kubectl get secret app-secrets -n production -o jsonpath='{.data.password}' | base64 -d

# Get PVCs and PVs
kubectl get pvc -n production
kubectl describe pvc database-pvc -n production
kubectl get pv

# Get events (sorted by timestamp)
kubectl get events -n production --sort-by='.lastTimestamp'
kubectl get events -n production --field-selector involvedObject.name=web-app-7d5c8b9f4-xk2pm
```

## Debug Pod

### Ephemeral Debug Container

```bash
# Attach debug container to running pod
kubectl debug -it web-app-7d5c8b9f4-xk2pm -n production \
  --image=busybox:latest \
  --target=web-app

# Create copy of pod with debug tools
kubectl debug web-app-7d5c8b9f4-xk2pm -n production \
  -it \
  --image=ubuntu:latest \
  --share-processes \
  --copy-to=web-app-debug

# Debug with different image
kubectl debug web-app-7d5c8b9f4-xk2pm -n production \
  -it \
  --image=nicolaka/netshoot:latest \
  --target=web-app
```

### Debug on Node

```bash
# Create privileged pod on specific node
kubectl debug node/node-01 -it --image=ubuntu:latest

# Access node filesystem
kubectl debug node/node-01 -it --image=ubuntu:latest -- chroot /host
```

## Common Issues and Solutions

### Issue 1: Pod in Pending State

```bash
# Check pod status and events
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production

# Common causes:
# 1. Insufficient resources
kubectl top nodes
kubectl describe nodes

# 2. PVC not bound
kubectl get pvc -n production
kubectl describe pvc database-pvc -n production

# 3. ImagePullBackOff
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production | grep -A 10 Events

# 4. Node selector/affinity issues
kubectl get pod web-app-7d5c8b9f4-xk2pm -n production -o yaml | grep -A 5 nodeSelector
```

### Issue 2: CrashLoopBackOff

```bash
# Check logs from crashed container
kubectl logs web-app-7d5c8b9f4-xk2pm -n production --previous

# Check if liveness probe is failing
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production | grep -A 10 "Liveness"

# Debug with different command
kubectl run debug-pod --image=myapp:latest -it --rm --restart=Never -- /bin/sh

# Check resource limits
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production | grep -A 10 "Limits"
```

### Issue 3: ImagePullBackOff

```bash
# Check image pull secret
kubectl get secret registry-credentials -n production -o yaml

# Test image pull manually
kubectl run test-pull --image=myregistry.io/myapp:v1.2.0 \
  --image-pull-policy=Always \
  --restart=Never \
  -n production

# Create/update image pull secret
kubectl create secret docker-registry registry-credentials \
  --docker-server=myregistry.io \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=user@example.com \
  -n production
```

### Issue 4: Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints web-app -n production
kubectl describe endpoints web-app -n production

# Verify pod labels match service selector
kubectl get pod web-app-7d5c8b9f4-xk2pm -n production --show-labels
kubectl get service web-app -n production -o yaml | grep -A 3 selector

# Test service connectivity from debug pod
kubectl run debug --image=nicolaka/netshoot:latest -it --rm -n production -- bash
# Inside pod:
curl http://web-app.production.svc.cluster.local
nslookup web-app.production.svc.cluster.local
telnet web-app.production.svc.cluster.local 80
```

### Issue 5: DNS Resolution Issues

```bash
# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns

# Test DNS resolution
kubectl run dnsutils --image=tutum/dnsutils -it --rm -- bash
# Inside pod:
nslookup kubernetes.default
nslookup web-app.production.svc.cluster.local
dig web-app.production.svc.cluster.local

# Check DNS config in pod
kubectl exec web-app-7d5c8b9f4-xk2pm -n production -- cat /etc/resolv.conf
```

### Issue 6: NetworkPolicy Blocking Traffic

```bash
# List network policies
kubectl get networkpolicy -n production
kubectl describe networkpolicy default-deny-all -n production

# Test connectivity
kubectl run test-connectivity --image=nicolaka/netshoot:latest -it --rm -n production -- bash
# Inside pod:
curl -v http://web-app:80
nc -zv web-app 80

# Temporarily allow all traffic (testing only)
kubectl delete networkpolicy --all -n production
```

### Issue 7: High Resource Usage

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n production
kubectl top pod web-app-7d5c8b9f4-xk2pm -n production --containers

# Check resource requests and limits
kubectl describe pod web-app-7d5c8b9f4-xk2pm -n production | grep -A 10 "Limits"

# Get pods sorted by CPU/memory usage
kubectl top pods -n production --sort-by=cpu
kubectl top pods -n production --sort-by=memory

# Check node capacity
kubectl describe node node-01 | grep -A 10 "Allocated resources"
```

### Issue 8: PersistentVolumeClaim Issues

```bash
# Check PVC status
kubectl get pvc -n production
kubectl describe pvc database-pvc -n production

# Check PV status
kubectl get pv
kubectl describe pv pvc-abc123

# Check storage class
kubectl get storageclass
kubectl describe storageclass fast-ssd

# Events related to PVC
kubectl get events -n production --field-selector involvedObject.name=database-pvc
```

## Advanced Debugging

### API Server Debugging

```bash
# Enable verbose output
kubectl get pods -n production -v=9

# Check API server logs (on master node)
journalctl -u kube-apiserver -f

# Check cluster info
kubectl cluster-info
kubectl cluster-info dump > cluster-dump.txt
```

### RBAC Debugging

```bash
# Check if ServiceAccount can perform action
kubectl auth can-i get pods --as=system:serviceaccount:production:web-app-sa -n production

# List permissions for ServiceAccount
kubectl describe sa web-app-sa -n production
kubectl describe role web-app-role -n production
kubectl describe rolebinding web-app-rolebinding -n production

# Check all permissions
kubectl auth can-i --list --as=system:serviceaccount:production:web-app-sa -n production
```

### Performance Debugging

```bash
# Get resource metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods

# Check pod overhead
kubectl get pod web-app-7d5c8b9f4-xk2pm -n production -o json | jq '.spec.overhead'

# Check priority classes
kubectl get priorityclasses
kubectl describe priorityclass high-priority
```

## Diagnostic Tools

### Network Tools Container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: netshoot
  namespace: production
spec:
  containers:
  - name: netshoot
    image: nicolaka/netshoot:latest
    command: ["/bin/sleep", "3600"]
  restartPolicy: Never
```

### Database Client Container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: postgres-client
  namespace: production
spec:
  containers:
  - name: postgres
    image: postgres:15-alpine
    command: ["/bin/sleep", "3600"]
    env:
    - name: PGHOST
      value: postgres-service
    - name: PGUSER
      value: myapp
    - name: PGPASSWORD
      valueFrom:
        secretKeyRef:
          name: postgres-secrets
          key: password
  restartPolicy: Never
```

## Quick Reference

### Pod States
- **Pending**: Waiting to be scheduled
- **ContainerCreating**: Pulling image / creating container
- **Running**: Pod is running
- **Succeeded**: All containers exited successfully
- **Failed**: At least one container failed
- **CrashLoopBackOff**: Container keeps crashing
- **ImagePullBackOff**: Cannot pull image
- **ErrImagePull**: Image pull error
- **Unknown**: Cannot get pod status

### Common Exit Codes
- **0**: Success
- **1**: General error
- **137**: SIGKILL (OOMKilled - out of memory)
- **139**: SIGSEGV (segmentation fault)
- **143**: SIGTERM (graceful termination)

## Best Practices

1. **Logs**: Always check logs first with `kubectl logs`
2. **Events**: Use `kubectl describe` to see events
3. **Labels**: Use consistent labels for easier debugging
4. **Resources**: Set appropriate requests and limits
5. **Health Checks**: Implement proper liveness and readiness probes
6. **Monitoring**: Set up comprehensive monitoring and alerting
7. **Debug Tools**: Keep debug containers ready
8. **Documentation**: Document common issues and solutions
````

### `references/workloads.md`

````markdown
# Kubernetes Workloads

## Deployment Pattern

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    tier: frontend
spec:
  replicas: 3
  revisionHistoryLimit: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        tier: frontend
        version: v1.2.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      serviceAccountName: web-app-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: app
        image: myregistry.io/web-app:v1.2.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: ENVIRONMENT
          value: production
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database.host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        - name: cache
          mountPath: /var/cache
      volumes:
      - name: config
        configMap:
          name: app-config
      - name: cache
        emptyDir: {}
```

## StatefulSet Pattern

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: database
spec:
  serviceName: postgres-headless
  replicas: 3
  podManagementPolicy: OrderedReady
  updateStrategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      serviceAccountName: postgres-sa
      securityContext:
        runAsUser: 999
        fsGroup: 999
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - name: postgres
          containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - postgres
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - postgres
          initialDelaySeconds: 10
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 50Gi
```

## DaemonSet Pattern

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true
      hostPID: true
      serviceAccountName: node-exporter-sa
      tolerations:
      - effect: NoSchedule
        operator: Exists
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        args:
        - --path.procfs=/host/proc
        - --path.sysfs=/host/sys
        - --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)
        ports:
        - name: metrics
          containerPort: 9100
          protocol: TCP
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
        volumeMounts:
        - name: proc
          mountPath: /host/proc
          readOnly: true
        - name: sys
          mountPath: /host/sys
          readOnly: true
      volumes:
      - name: proc
        hostPath:
          path: /proc
      - name: sys
        hostPath:
          path: /sys
```

## Job Pattern

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-20231214
  namespace: production
spec:
  backoffLimit: 3
  ttlSecondsAfterFinished: 3600
  template:
    metadata:
      labels:
        app: db-migration
    spec:
      restartPolicy: OnFailure
      serviceAccountName: migration-sa
      containers:
      - name: migrate
        image: myregistry.io/migrations:v1.2.0
        command: ["/bin/sh", "-c"]
        args:
        - |
          echo "Starting migration..."
          /app/migrate up
          echo "Migration complete"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: connection-string
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

## CronJob Pattern

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-database
  namespace: production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  timeZone: "America/New_York"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      backoffLimit: 2
      ttlSecondsAfterFinished: 86400
      template:
        metadata:
          labels:
            app: backup
        spec:
          restartPolicy: OnFailure
          serviceAccountName: backup-sa
          containers:
          - name: backup
            image: myregistry.io/backup-tool:latest
            command: ["/usr/local/bin/backup.sh"]
            env:
            - name: S3_BUCKET
              valueFrom:
                configMapKeyRef:
                  name: backup-config
                  key: s3-bucket
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: backup-secrets
                  key: aws-access-key
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: backup-secrets
                  key: aws-secret-key
            resources:
              requests:
                cpu: 200m
                memory: 256Mi
              limits:
                cpu: 1000m
                memory: 1Gi
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            emptyDir:
              sizeLimit: 10Gi
```

## Init Containers

```yaml
spec:
  initContainers:
  - name: wait-for-db
    image: busybox:latest
    command: ['sh', '-c']
    args:
    - |
      until nc -z postgres-service 5432; do
        echo "Waiting for database..."
        sleep 2
      done
      echo "Database is ready"
  - name: migrate-schema
    image: myregistry.io/migrations:latest
    command: ["/app/migrate", "up"]
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: db-secrets
          key: url
  containers:
  - name: app
    image: myregistry.io/app:latest
```

## Best Practices

1. **Resource Management**: Always set requests and limits
2. **Health Checks**: Include both liveness and readiness probes
3. **Security**: Use non-root users, read-only filesystems when possible
4. **Labels**: Consistent labeling for organization and selection
5. **Update Strategy**: Choose appropriate strategy (RollingUpdate, Recreate)
6. **Service Accounts**: Never use default, create specific SAs
7. **Image Tags**: Use specific versions, not `latest` in production
8. **Cleanup**: Set TTL for Jobs to auto-cleanup completed pods
````

### `SKILL.md`

````markdown
---
name: kubernetes-specialist
description: Use when deploying or managing Kubernetes workloads. Invoke to create deployment manifests, configure pod security policies, set up service accounts, define network isolation rules, debug pod crashes, analyze resource limits, inspect container logs, or right-size workloads. Use for Helm charts, RBAC policies, NetworkPolicies, storage configuration, performance optimization, GitOps pipelines, and multi-cluster management.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.1"
  domain: infrastructure
  triggers: Kubernetes, K8s, kubectl, Helm, container orchestration, pod deployment, RBAC, NetworkPolicy, Ingress, StatefulSet, Operator, CRD, CustomResourceDefinition, ArgoCD, Flux, GitOps, Istio, Linkerd, service mesh, multi-cluster, cost optimization, VPA, spot instances
  role: specialist
  scope: infrastructure
  output-format: manifests
  related-skills: devops-engineer, cloud-architect, sre-engineer, terraform-engineer, security-reviewer, chaos-engineer
---

# Kubernetes Specialist

## When to Use This Skill

- Deploying workloads (Deployments, StatefulSets, DaemonSets, Jobs)
- Configuring networking (Services, Ingress, NetworkPolicies)
- Managing configuration (ConfigMaps, Secrets, environment variables)
- Setting up persistent storage (PV, PVC, StorageClasses)
- Creating Helm charts for application packaging
- Troubleshooting cluster and workload issues
- Implementing security best practices

## Core Workflow

1. **Analyze requirements** — Understand workload characteristics, scaling needs, security requirements
2. **Design architecture** — Choose workload types, networking patterns, storage solutions
3. **Implement manifests** — Create declarative YAML with proper resource limits, health checks
4. **Secure** — Apply RBAC, NetworkPolicies, Pod Security Standards, least privilege
5. **Validate** — Run `kubectl rollout status`, `kubectl get pods -w`, and `kubectl describe pod <name>` to confirm health; roll back with `kubectl rollout undo` if needed

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Workloads | `references/workloads.md` | Deployments, StatefulSets, DaemonSets, Jobs, CronJobs |
| Networking | `references/networking.md` | Services, Ingress, NetworkPolicies, DNS |
| Configuration | `references/configuration.md` | ConfigMaps, Secrets, environment variables |
| Storage | `references/storage.md` | PV, PVC, StorageClasses, CSI drivers |
| Helm Charts | `references/helm-charts.md` | Chart structure, values, templates, hooks, testing, repositories |
| Troubleshooting | `references/troubleshooting.md` | kubectl debug, logs, events, common issues |
| Custom Operators | `references/custom-operators.md` | CRD, Operator SDK, controller-runtime, reconciliation |
| Service Mesh | `references/service-mesh.md` | Istio, Linkerd, traffic management, mTLS, canary |
| GitOps | `references/gitops.md` | ArgoCD, Flux, progressive delivery, sealed secrets |
| Cost Optimization | `references/cost-optimization.md` | VPA, HPA tuning, spot instances, quotas, right-sizing |
| Multi-Cluster | `references/multi-cluster.md` | Cluster API, federation, cross-cluster networking, DR |

## Constraints

### MUST DO
- Use declarative YAML manifests (avoid imperative kubectl commands)
- Set resource requests and limits on all containers
- Include liveness and readiness probes
- Use secrets for sensitive data (never hardcode credentials)
- Apply least privilege RBAC permissions
- Implement NetworkPolicies for network segmentation
- Use namespaces for logical isolation
- Label resources consistently for organization
- Document configuration decisions in annotations

### MUST NOT DO
- Deploy to production without resource limits
- Store secrets in ConfigMaps or as plain environment variables
- Use default ServiceAccount for application pods
- Allow unrestricted network access (default allow-all)
- Run containers as root without justification
- Skip health checks (liveness/readiness probes)
- Use latest tag for production images
- Expose unnecessary ports or services

## Common YAML Patterns

### Deployment with resource limits, probes, and security context

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-namespace
  labels:
    app: my-app
    version: "1.2.3"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
        version: "1.2.3"
    spec:
      serviceAccountName: my-app-sa   # never use default SA
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
        - name: my-app
          image: my-registry/my-app:1.2.3   # never use latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          envFrom:
            - secretRef:
                name: my-app-secret   # pull credentials from Secret, not ConfigMap
```

### Minimal RBAC (least privilege)

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: my-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: my-app-role
  namespace: my-namespace
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]   # grant only what is needed
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-rolebinding
  namespace: my-namespace
subjects:
  - kind: ServiceAccount
    name: my-app-sa
    namespace: my-namespace
roleRef:
  kind: Role
  name: my-app-role
  apiGroup: rbac.authorization.k8s.io
```

### NetworkPolicy (default-deny + explicit allow)

```yaml
# Deny all ingress and egress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: my-namespace
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
# Allow only specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-my-app
  namespace: my-namespace
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

## Validation Commands

After deploying, verify health and security posture:

```bash
# Watch rollout complete
kubectl rollout status deployment/my-app -n my-namespace

# Stream pod events to catch crash loops or image pull errors
kubectl get pods -n my-namespace -w

# Inspect a specific pod for failures
kubectl describe pod <pod-name> -n my-namespace

# Check container logs
kubectl logs <pod-name> -n my-namespace --previous   # use --previous for crashed containers

# Verify resource usage vs. limits
kubectl top pods -n my-namespace

# Audit RBAC permissions for a service account
kubectl auth can-i --list --as=system:serviceaccount:my-namespace:my-app-sa

# Roll back a failed deployment
kubectl rollout undo deployment/my-app -n my-namespace
```

## Output Templates

When implementing Kubernetes resources, provide:
1. Complete YAML manifests with proper structure
2. RBAC configuration if needed (ServiceAccount, Role, RoleBinding)
3. NetworkPolicy for network isolation
4. Brief explanation of design decisions and security considerations

[Documentation](https://jeffallan.github.io/claude-skills/skills/infrastructure/kubernetes-specialist/)
````
