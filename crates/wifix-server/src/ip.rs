use std::net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket};

pub fn detect_lan_ip() -> Option<IpAddr> {
    let socket = UdpSocket::bind(SocketAddr::from((Ipv4Addr::UNSPECIFIED, 0))).ok()?;
    socket.connect(SocketAddr::from(([8, 8, 8, 8], 80))).ok()?;
    let addr = socket.local_addr().ok()?;
    Some(addr.ip())
}
