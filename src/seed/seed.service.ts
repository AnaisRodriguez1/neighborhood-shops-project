import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersResponse } from './interfaces/users.response.interface';

@Injectable()
export class SeedService {




  async executeSeed() {
    const {data} = await axios.get<UsersResponse>('https://dummyjson.com/users?limit=5');

    return data.users;
  }
}
