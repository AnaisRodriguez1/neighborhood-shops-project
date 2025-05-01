import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { UsersResponse } from './interfaces/users.response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {

  private readonly axios : AxiosInstance = axios;

  constructor (
    @InjectModel( User.name )
    private readonly userModel : Model<User>,
  ){}

  async executeSeed() {
    const {data} = await axios.get<UsersResponse>('https://dummyjson.com/users?limit=5');

    return 'Seed Executed';
  }
}
