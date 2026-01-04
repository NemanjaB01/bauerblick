import pika
import json
import logging
import os

logger = logging.getLogger("rabbitmq")

rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')

def get_connection():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=rabbitmq_host)
    )
    return connection

def publish_message(data, routing_key, exchange="weather_exchange"):

    try:
        connection = get_connection()
        channel = connection.channel()

        channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)

        message = json.dumps(data)
        channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,
            )
        )
        connection.close()
    except Exception as e:
        logger.error(f"Failed to publish message to {routing_key}: {e}")

def start_consuming(exchange_name, queue_name, routing_key, callback_function):

    try:
        connection = get_connection()
        channel = connection.channel()

        channel.exchange_declare(exchange=exchange_name, exchange_type='topic', durable=True)

        result = channel.queue_declare(queue=queue_name, durable=True)
        final_queue_name = result.method.queue

        channel.queue_bind(exchange=exchange_name, queue=final_queue_name, routing_key=routing_key)

        logger.info(f" [*] Waiting for messages in {final_queue_name}. To exit press CTRL+C")

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=final_queue_name, on_message_callback=callback_function)

        channel.start_consuming()
    except Exception as e:
        logger.error(f"RabbitMQ Consumer failed: {e}")
