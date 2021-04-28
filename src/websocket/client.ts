import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { UsersService } from "../services/UsersService";
import { MessagesService } from "../services/MessagesService";

interface IParams {
  text: string;
  email: string;
}

io.on("connect", (socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messageService = new MessagesService();

  socket.on("client_first_access", async (params) => {
    const socket_id = socket.id;
    const { text, email } = params as IParams;
    let user_id = null;

    const userExists = await usersService.findByEmail(email);

    if (!userExists) {
      const user = await usersService.create(email);

      await connectionsService.create({ socket_id, user_id: user.id });
      user_id = user.id;
    } else {
      const connection = await connectionsService.findByUserId(userExists.id);

      user_id = userExists.id;

      if (!connection) {
        await connectionsService.create({ socket_id, user_id: userExists.id });
      } else {
        connection.socket_id = socket.id;

        await connectionsService.create(connection);
      }
    }

    await messageService.create({ text, user_id });

    const allMessages = await messageService.listByUser(user_id);

    socket.emit("client_list_all_messages", allMessages);
  });
});
