import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreatePessoaDto {
  @IsNotEmpty({ message: `nome ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @MaxLength(100, {
    message: `nome  ${EMensagem.MAIS_CARACTERES_QUE_PERMITIDO}`,
  })
  nome: string;

  @IsNotEmpty({ message: `documento ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @MaxLength(14, {
    message: `documento  ${EMensagem.MAIS_CARACTERES_QUE_PERMITIDO}`,
  })
  @MinLength(11, {
    message: `documento  ${EMensagem.MENOS_CARACTERES_QUE_PERMITIDO}`,
  })
  documento: string;

  @IsNotEmpty({ message: `cep ${EMensagem.NAO_PODE_SER_VAZIO}` })
  cep: string;

  @IsNotEmpty({ message: `endereco ${EMensagem.NAO_PODE_SER_VAZIO}` })
  endereco: string;

  @IsNotEmpty({ message: `telefone ${EMensagem.NAO_PODE_SER_VAZIO}` })
  telefone: string;

  @IsNotEmpty({ message: `ativo ${EMensagem.NAO_PODE_SER_VAZIO}` })
  ativo: boolean;
}
