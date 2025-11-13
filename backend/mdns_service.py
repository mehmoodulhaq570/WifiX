"""
Enhanced mDNS (Multicast DNS) Service Discovery
Provides better device discovery using human-readable names.
"""
import socket
import logging
from typing import Optional
from zeroconf import ServiceInfo, Zeroconf

logger = logging.getLogger(__name__)


class MDNSService:
    """Manages mDNS service advertisement for local network discovery."""
    
    def __init__(self):
        self.zeroconf: Optional[Zeroconf] = None
        self.service_info: Optional[ServiceInfo] = None
        self.is_running = False
        
    def start(self, port: int, ip: str, service_name: Optional[str] = None) -> bool:
        """
        Start advertising the service via mDNS.
        
        Args:
            port: Port number the service is running on
            ip: IP address to advertise
            service_name: Optional custom service name (defaults to hostname)
            
        Returns:
            True if successfully started, False otherwise
        """
        if self.is_running:
            logger.warning("mDNS service already running")
            return True
            
        try:
            # Use custom name or hostname
            if service_name is None:
                service_name = socket.gethostname()
            
            # Clean the service name (remove spaces and special chars)
            clean_name = service_name.replace(' ', '-').replace('_', '-')
            
            # Create service name following mDNS naming convention
            # Format: ServiceName._service-type._tcp.local.
            full_service_name = f"{clean_name}._wifix._tcp.local."
            
            # Service properties (metadata)
            properties = {
                'path': '/',
                'version': '1.0',
                'description': 'WifiX File Sharing Server'
            }
            
            # Create service info
            self.service_info = ServiceInfo(
                "_wifix._tcp.local.",
                full_service_name,
                addresses=[socket.inet_aton(ip)],
                port=port,
                properties=properties,
                server=f"{clean_name}.local."
            )
            
            # Start Zeroconf and register service
            self.zeroconf = Zeroconf()
            self.zeroconf.register_service(self.service_info)
            
            self.is_running = True
            
            logger.info(f"mDNS: Service registered as '{full_service_name}'")
            logger.info(f"mDNS: Accessible at http://{clean_name}.local:{port}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to start mDNS service: {e}")
            return False
    
    def stop(self) -> None:
        """Stop advertising the service."""
        if not self.is_running:
            return
            
        try:
            if self.zeroconf and self.service_info:
                self.zeroconf.unregister_service(self.service_info)
                self.zeroconf.close()
                logger.info("mDNS: Service unregistered")
            
            self.is_running = False
            self.zeroconf = None
            self.service_info = None
            
        except Exception as e:
            logger.error(f"Error stopping mDNS service: {e}")
    
    def update_service(self, port: int, ip: str, service_name: Optional[str] = None) -> bool:
        """
        Update the service information (restart with new details).
        
        Args:
            port: New port number
            ip: New IP address
            service_name: New service name
            
        Returns:
            True if successfully updated, False otherwise
        """
        self.stop()
        return self.start(port, ip, service_name)
    
    def get_status(self) -> dict:
        """
        Get current mDNS service status.
        
        Returns:
            Dictionary with status information
        """
        if not self.is_running or not self.service_info:
            return {
                'running': False,
                'service_name': None,
                'url': None
            }
        
        # Extract hostname from server name (remove .local.)
        hostname = self.service_info.server.rstrip('.')
        port = self.service_info.port
        
        return {
            'running': True,
            'service_name': self.service_info.name,
            'hostname': hostname,
            'url': f"http://{hostname}:{port}",
            'port': port
        }


# Singleton instance
_mdns_service = None


def get_mdns_service() -> MDNSService:
    """Get the global mDNS service instance."""
    global _mdns_service
    if _mdns_service is None:
        _mdns_service = MDNSService()
    return _mdns_service
