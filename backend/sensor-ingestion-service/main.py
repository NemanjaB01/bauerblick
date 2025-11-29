from scheduler.scheduler import start_scheduler
from health import check_dil_health
from weather.logger import setup_logger

logger = setup_logger(name="main")

if __name__ == "__main__":
    logger.info("AGRISCOPE starting")

    health = check_dil_health()
    print("Initial DIL Health Check:", health)

    if health["status"] == "unhealthy":
        logger.error("System unhealthy, cannot start scheduler")
        exit(1)

    try:
        start_scheduler()
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")
    except Exception as e:
        logger.error(f"Scheduler crashed: {e}")
        exit(1)