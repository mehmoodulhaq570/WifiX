"""
Room Code Management System
Generates and manages short, memorable codes that map to connection details.
"""
import random
import string
from typing import Dict, Optional
from datetime import datetime, timedelta


class RoomCodeManager:
    """Manages generation and validation of room codes for easy device connections."""
    
    def __init__(self, code_length: int = 6, ttl_minutes: int = 60):
        """
        Initialize the room code manager.
        
        Args:
            code_length: Length of generated codes (default: 6)
            ttl_minutes: Time-to-live for codes in minutes (default: 60)
        """
        self.code_length = code_length
        self.ttl_minutes = ttl_minutes
        # Storage: {code: {'ip': str, 'port': int, 'created_at': datetime, 'name': str}}
        self.codes: Dict[str, dict] = {}
        
    def generate_code(self, ip: str, port: int, name: Optional[str] = None) -> str:
        """
        Generate a unique room code.
        
        Args:
            ip: IP address to associate with the code
            port: Port number to associate with the code
            name: Optional friendly name for the room
            
        Returns:
            Generated room code (e.g., "ABC123")
        """
        # Use uppercase letters and numbers for readability (avoid confusing characters like O/0, I/1)
        chars = string.ascii_uppercase.replace('O', '').replace('I', '') + string.digits.replace('0', '').replace('1', '')
        
        # Generate unique code
        max_attempts = 100
        for _ in range(max_attempts):
            code = ''.join(random.choices(chars, k=self.code_length))
            if code not in self.codes:
                self.codes[code] = {
                    'ip': ip,
                    'port': port,
                    'created_at': datetime.now(),
                    'name': name or f"Room {code}"
                }
                return code
        
        raise RuntimeError(f"Failed to generate unique code after {max_attempts} attempts")
    
    def get_connection_details(self, code: str) -> Optional[dict]:
        """
        Get connection details for a room code.
        
        Args:
            code: The room code to lookup (case-insensitive)
            
        Returns:
            Dictionary with connection details or None if code not found/expired
        """
        code = code.upper().strip()
        
        if code not in self.codes:
            return None
        
        details = self.codes[code]
        created_at = details['created_at']
        
        # Check if code has expired
        if datetime.now() - created_at > timedelta(minutes=self.ttl_minutes):
            del self.codes[code]
            return None
        
        return {
            'ip': details['ip'],
            'port': details['port'],
            'name': details['name'],
            'url': f"http://{details['ip']}:{details['port']}"
        }
    
    def validate_code(self, code: str) -> bool:
        """
        Check if a code is valid and not expired.
        
        Args:
            code: The room code to validate
            
        Returns:
            True if code is valid, False otherwise
        """
        return self.get_connection_details(code) is not None
    
    def delete_code(self, code: str) -> bool:
        """
        Delete a room code.
        
        Args:
            code: The room code to delete
            
        Returns:
            True if code was deleted, False if not found
        """
        code = code.upper().strip()
        if code in self.codes:
            del self.codes[code]
            return True
        return False
    
    def cleanup_expired(self) -> int:
        """
        Remove all expired codes.
        
        Returns:
            Number of codes removed
        """
        expired = []
        cutoff = datetime.now() - timedelta(minutes=self.ttl_minutes)
        
        for code, details in self.codes.items():
            if details['created_at'] < cutoff:
                expired.append(code)
        
        for code in expired:
            del self.codes[code]
        
        return len(expired)
    
    def list_active_codes(self) -> Dict[str, dict]:
        """
        Get all active (non-expired) codes.
        
        Returns:
            Dictionary of active codes with their details
        """
        self.cleanup_expired()
        return {
            code: {
                'name': details['name'],
                'created_at': details['created_at'].isoformat(),
                'expires_at': (details['created_at'] + timedelta(minutes=self.ttl_minutes)).isoformat()
            }
            for code, details in self.codes.items()
        }


# Singleton instance
_manager = None


def get_room_code_manager() -> RoomCodeManager:
    """Get the global room code manager instance."""
    global _manager
    if _manager is None:
        _manager = RoomCodeManager()
    return _manager
