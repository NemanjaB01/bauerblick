import json
from weather.processor import fetch_and_publish_for_farm
from weather.enums import ForecastType
from messaging.rabbitmq import start_consuming
from weather.logger import setup_logger

logger = setup_logger(name="farm_listener")

def process_new_farm_event(ch, method, properties, body):

    try:
        message = json.loads(body)
        logger.info(f"Received farm event: {message}")

        user_id = message.get("user_id")
        farm_data = message.get("farm")

        if user_id and farm_data:
            logger.info(f"Processing initial weather fetch for farm ID: {farm_data.get('id')}")

            fetch_and_publish_for_farm(user_id, farm_data, ForecastType.CURRENT)
            fetch_and_publish_for_farm(user_id, farm_data, ForecastType.HOURLY)
            fetch_and_publish_for_farm(user_id, farm_data, ForecastType.DAILY)

            logger.info(f"Successfully processed new farm: {farm_data.get('id')}")

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error(f"Error processing farm event: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_listening():

    start_consuming(
        exchange_name="farm_events",
        queue_name="weather_ingestion_new_farms",
        routing_key="farm.created",
        callback_function=process_new_farm_event
    )