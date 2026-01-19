const HOST = "127.0.0.1";
const PORT = 3000;

const clients = new Set<any>();

const server = Bun.listen({
    hostname: HOST,
    port: PORT,

    socket: {
        open(socket) {
            clients.add(socket);
            socket.write("Client Connected\n\n");
        },

        data(socket, data) {
            clients.forEach(client => {
                client.write(`Message: ${data}`)
            });
        },

        close(socket) {
            clients.delete(socket)
        },
        error(socket) {
            clients.delete(socket)
        },
    },
});

console.log(`Starting TCP Server at ${HOST}:${PORT}`);