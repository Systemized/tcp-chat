import type { Socket } from "bun";

const HOST = "127.0.0.1";
const PORT = 3000;

interface User {
    username: string;
    socket: Socket;
}

const clients = new Map<string, User>();
const socketToUser = new Map<Socket, string>();

const closeSocket = (sock: Socket) => {
    const user = socketToUser.get(sock);
    if (!user) return;

    clients.delete(user);
    socketToUser.delete(sock)
    return user;
}

const server = Bun.listen({
    hostname: HOST,
    port: PORT,

    socket: {
        open(sock) {
            sock.write("Welcome to TCP Server. Enter a username:\n")
        },

        data(sock: Socket, data: Buffer) {
            const txt = data.toString().trim()
            if (!txt) return;

            // If user's socket not found, set user input as username and map sockets/username
            if (!socketToUser.get(sock)) {
                if (clients.get(txt)) {
                    sock.write("Username already taken. Enter a username:\n")
                    return;
                };

                if (txt.length > 16) {
                    sock.write("Username must be under 16 Chars. Enter a username:\n")
                    return;
                }

                console.log(`Enter - ${txt} joined the room`);
                socketToUser.set(sock, txt);
                clients.set(txt, { username: txt, socket: sock });
                clients.forEach(client => {
                    client.socket.write(`${txt} has joined the room. There are ${socketToUser.size} users online\n\n`)
                })

                return;
            } else {
                const user = socketToUser.get(sock)
                if (!user) return;

                console.log(`Recieved - ${user}: ${txt}`);
                clients.forEach(client => {
                    if (client.username !== user) {
                        client.socket.write(`${user}: ${txt}\n`);
                    }
                });
            }


        },

        close(sock: Socket) {
            const user = closeSocket(sock);
            
            console.log(`Exit - ${user} left the room`);
            clients.forEach(client => {
                client.socket.write(`${user} has left the room. There are ${socketToUser.size} users online\n`)
            })
        },

        error(sock: Socket, err: Error) {
            closeSocket(sock);
            console.error(`${sock} Error - ${err.message}`);
        }
    }
})

console.log(`TCP Server is running at ${HOST}:${PORT}`);
