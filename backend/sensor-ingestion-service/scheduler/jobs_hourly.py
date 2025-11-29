import json
from weather.client import WeatherClient
from weather.enums import ForecastType
from messaging.rabbitmq import publish_message
from weather.logger import setup_logger
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_FILE = os.path.join(BASE_DIR, "data", "users.json")

logger = setup_logger(name="hourly_job")
client = WeatherClient()


def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def fetch_hourly_weather_for_all():
    users = load_users()
    logger.info("Fetching HOURLY weather for all users/farms")
    for user in users:
        user_id = user["id"]
        user_name = user.get("name", user_id)
        farms = user.get("farms", [])

        if not farms:
            logger.warning(f"User {user_name} ({user_id}) has no farms configured")
            continue

        for farm in farms:
            farm_id = farm["id"]
            farm_name = farm.get("name", farm_id)
            lat = farm["lat"]
            lon = farm["lon"]
            crops = farm.get("crops", [])

            try:
                df = client.get_forecast(lat, lon, ForecastType.HOURLY)
                df["date"] = df["date"].astype(str)

                payload = {
                    "type": "hourly",
                    "user_id": user_id,
                    "farm_id": farm_id,
                    "farm_name": farm_name,
                    "crops": crops,
                    "lat": lat,
                    "lon": lon,
                    "forecast": df.to_dict(orient="records")
                }

                publish_message(payload, routing_key="weather.hourly")
                logger.info(
                    f"Published hourly forecast for user={user_name} ({user_id}), "
                    f"farm={farm_name} ({farm_id})"
                )
            except Exception as e:
                logger.error(
                    f"Error fetching hourly weather for user={user_name} ({user_id}), "
                    f"farm={farm_name} ({farm_id}): {e}",
                    exc_info=True
                )