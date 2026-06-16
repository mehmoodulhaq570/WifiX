import atexit
import logging
import os
import socket

try:
    from .app import app, _detect_lan_ip
except ImportError:
    from app import app, _detect_lan_ip

logger = logging.getLogger(__name__)

_zeroconf = None
_service_info = None


def _register_zeroconf():
    global _zeroconf, _service_info

    if os.environ.get("ENABLE_ZEROCONF", "1") != "1":
        return

    try:
        from zeroconf import ServiceInfo, Zeroconf

        lan_ip = _detect_lan_ip()
        port = int(os.environ.get("PORT", 5000))
        service_name = f"WifiX on {lan_ip}._wifi-share._tcp.local."

        _service_info = ServiceInfo(
            "_wifi-share._tcp.local.",
            service_name,
            addresses=[socket.inet_aton(lan_ip)],
            port=port,
            properties={"path": "/"},
            server=(socket.gethostname() + ".local."),
        )
        _zeroconf = Zeroconf()
        _zeroconf.register_service(_service_info)
        logger.info("Zeroconf: registered service %s", service_name)
    except Exception as exc:
        logger.warning("Zeroconf registration failed: %s", exc)


def _cleanup_zeroconf():
    try:
        if _zeroconf and _service_info:
            _zeroconf.unregister_service(_service_info)
            _zeroconf.close()
            logger.info("Zeroconf: service unregistered")
    except Exception:
        pass


_register_zeroconf()
atexit.register(_cleanup_zeroconf)
