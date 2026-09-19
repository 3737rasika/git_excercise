#127.0.0.1 is the loopback address (also called localhost) in IPv4.
host='127.0.0.1'

port = 1337
import socket
s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect((host,port))
st = 'connection done'
byt = st.encode()
s.send(byt)