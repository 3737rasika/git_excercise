host='127.0.0.1'

port = 1337
import socket
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.bind((host,port))
s.listen(1)
conn, addr=s.accept()
data = conn.recv(2000)
data.decode()
print(data.decode())