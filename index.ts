import type { Socket } from "bun";

const HOST = "127.0.0.1";
const PORT = 3000;

interface User {
    username: string;
    socket: any;
}

const clients = new Map<string, User>();
const socketToUser = new Map<any, string>();

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
            sock.write("Welcome to TCP Server. Enter a username: ")
        },

        data(sock: any, data: Buffer) {
            const txt = data.toString().trim()
            if (!txt) return;

            // If username not found/ undefined, set user input as username
            if (!socketToUser.get(sock)) {
                if (clients.get(txt)) {
                    sock.write("Username already taken. Enter a username: ")
                    return;
                };

                console.log(`Enter - ${txt} joined the room`);
                socketToUser.set(sock, txt);
                clients.set(txt, { username: txt, socket: sock });
                clients.forEach(client => {
                    client.socket.write(`${txt} has joined the room. There are ${socketToUser.size} users online\n\n`)
                })

                return;
            } else {
                const user = socketToUser.get(sock)
                
                sock.write(`${user}: `)
                console.log(`Recieved - ${user}: ${txt}`);
                clients.forEach(client => {
                    if (client.username !== user) {
                        client.socket.write(`${user}: ${txt}\n`);
                    }
                });
            }


        },

        close(sock) {
            const user = closeSocket(sock);
            
            console.log(`Exit - ${user} left the room`);
            clients.forEach(client => {
                client.socket.write(`${user} has left the room. There are ${socketToUser.size} users online\n`)
            })
        },

        error(sock, err) {
            closeSocket(sock);
            console.error(`${sock} Error - ${err.message}`);
        }
    }
})

console.log(`TCP Server is running at ${HOST}:${PORT}`);
