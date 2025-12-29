import json
import os
from weather.enums import ForecastType
from weather.processor import fetch_and_publish_for_farm
from weather.logger import setup_logger

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_FILE = os.path.join(BASE_DIR, "data", "users.json")

logger = setup_logger(name="hourly_job")

def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def fetch_hourly_weather_for_all():
    users = load_users()
    logger.info("Fetching HOURLY weather for all users/farms")

    for user in users:
        user_id = user["id"]
        email = user["email"]
        farms = user.get("farms", [])

        for farm in farms:
            fetch_and_publish_for_farm(user_id, email, farm, ForecastType.HOURLY)