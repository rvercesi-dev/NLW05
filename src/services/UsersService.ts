import { getCustomRepository, Repository } from "typeorm";
import { User } from "../entities/User";
import { UsersRepository } from "../repositories/UserRepository";

class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  async create(email: string) {
    const userExists = await this.usersRepository.findOne({ email });

    if (userExists) {
      return userExists;
    } else {
      const user = await this.usersRepository.create({ email });

      await this.usersRepository.save(user);

      return user;
    }
  }
  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ email });
  }
}

export { UsersService };
