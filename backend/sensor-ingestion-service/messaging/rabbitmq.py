import pika
import json

def publish_message(data, routing_key):
    connection = pika.BlockingConnection(pika.ConnectionParameters("localhost", 5672))
    channel = connection.channel()

    channel.exchange_declare(exchange="weather_exchange", exchange_type="topic")

    message = json.dumps(data)
    channel.basic_publish(
        exchange="weather_exchange",
        routing_key=routing_key,  
        body=message
    )

    connection.close()
