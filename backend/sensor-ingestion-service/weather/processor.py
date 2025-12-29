from weather.client import WeatherClient
from weather.enums import ForecastType
from messaging.rabbitmq import publish_message
from weather.logger import setup_logger

logger = setup_logger(name="weather_processor")
client = WeatherClient() #

def fetch_and_publish_for_farm(user_id, email, farm_data, forecast_type: ForecastType):
    farm_id = farm_data.get("id")
    farm_name = farm_data.get("name", farm_id)

    lat = farm_data.get("lat")
    lon = farm_data.get("lon")
    crops = farm_data.get("crops", [])

    try:
        df = client.get_forecast(lat, lon, forecast_type)

        if "time" in df.columns:
            df["time"] = df["time"].astype(str)
        if "date" in df.columns:
            df["date"] = df["date"].astype(str)

        routing_key_map = {
            ForecastType.CURRENT: "weather.current",
            ForecastType.HOURLY: "weather.hourly",
            ForecastType.DAILY: "weather.daily"
        }

        msg_type_map = {
            ForecastType.CURRENT: "current",
            ForecastType.HOURLY: "hourly",
            ForecastType.DAILY: "daily"
        }

        payload = {
            "type": msg_type_map[forecast_type],
            "user_id": user_id,
            "email": email,
            "farm_id": farm_id,
            "farm_name": farm_name,
            "crops": crops,
            "lat": lat,
            "lon": lon,
            "forecast": df.to_dict(orient="records")
        }

        routing_key = routing_key_map[forecast_type]
        publish_message(payload, routing_key=routing_key)

        logger.info(f"Processed {msg_type_map[forecast_type]} for farm {farm_id}")

    except Exception as e:
        logger.error(f"Failed to process farm {farm_id}: {e}")