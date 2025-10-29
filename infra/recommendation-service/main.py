import os
import redis
from flask import Flask, jsonify
# from google.cloud import aiplatform

app = Flask(__name__)

# Connect to Memorystore (Redis)
# The host is retrieved from an environment variable set during deployment
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
redis_client = redis.StrictRedis(host=redis_host, port=redis_port)

@app.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """
    Provides property recommendations for a given user.
    1. Checks for cached recommendations in Redis.
    2. If not found, fetches from the Vertex AI endpoint.
    3. Caches the new recommendations and returns them.
    """
    cached_recs = redis_client.get(f'recs:{user_id}')
    if cached_recs:
        return jsonify({"source": "cache", "data": cached_recs.decode('utf-8')})

    # Placeholder for Vertex AI Endpoint call
    # aiplatform.init(project='your-gcp-project-id', location='us-central1')
    # endpoint = aiplatform.Endpoint('your-vertex-ai-endpoint-id')
    # response = endpoint.predict(instances=[{"user_id": user_id}])
    # new_recs = response.predictions
    
    new_recs = f"Recommended properties for user {user_id}: [prop_123, prop_456, prop_789]" # Placeholder

    redis_client.setex(f'recs:{user_id}', 3600, new_recs) # Cache for 1 hour

    return jsonify({"source": "model", "data": new_recs})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))