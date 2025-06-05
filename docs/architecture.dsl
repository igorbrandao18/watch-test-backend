workspace {
    model {
        user = person "User"
        
        enterprise "WatchMe" {
            api = softwareSystem "WatchMe API" {
                webapp = container "Web Application" "NestJS API" "Node.js" {
                    auth = component "Auth Module" "Autenticação JWT"
                    users = component "Users Module" "Gerenciamento de usuários"
                    movies = component "Movies Module" "Integração TMDb"
                }
                
                db = container "Database" "PostgreSQL" "Database" {
                    tags "Database"
                }
                
                cache = container "Cache" "Redis" "Cache" {
                    tags "Cache"
                }
                
                queue = container "Message Queue" "AWS SQS" "Events" {
                    tags "Queue"
                }
                
                monitoring = container "Monitoring" "OpenTelemetry + Jaeger" "Observability" {
                    tags "Monitoring"
                }
            }
            
            tmdb = softwareSystem "TMDb API" "Movie Database" "External System"
        }
        
        # Relationships
        user -> webapp "Uses" "HTTPS"
        
        auth -> db "Reads/Writes"
        users -> db "Reads/Writes"
        movies -> tmdb "Fetches movie data" "HTTPS"
        movies -> cache "Caches responses"
        
        webapp -> queue "Publishes events"
        webapp -> monitoring "Sends telemetry"
    }
    
    views {
        systemContext api {
            include *
            autoLayout
        }
        
        container api {
            include *
            autoLayout
        }
        
        component webapp {
            include *
            autoLayout
        }
        
        theme default
    }
} 