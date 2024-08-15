import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { CreatePessoaDto } from './create-pessoa.dto';

export class UpdatePessoaDto extends PartialType(CreatePessoaDto) {
  @IsNotEmpty({ message: `ID ${EMensagem.DEVE_SER_INFORMADO}` })
  id: number;
}
