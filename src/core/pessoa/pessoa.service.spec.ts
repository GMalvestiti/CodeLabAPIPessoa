import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IUsuario } from '../../shared/interfaces/usuario.interface';
import { ExportPdfService } from '../../shared/services/export-pdf.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';
import { PessoaService } from './pessoa.service';

const mockCreatePessoaDto: CreatePessoaDto = {
  nome: 'Teste Pessoa',
  documento: '12345678901',
  cep: '12345678',
  endereco: 'Rua Teste',
  telefone: '11999999999',
  ativo: true,
};

const mockUpdatePessoaDto: UpdatePessoaDto = Object.assign(
  mockCreatePessoaDto,
  { id: 1 },
);
const mockPessoa: Pessoa = Object.assign(mockCreatePessoaDto, { id: 1 });

const mockFindAllOrder: IFindAllOrder = {
  column: 'id',
  sort: 'asc',
};

const mockFindAllFilter: IFindAllFilter = {
  column: 'id',
  value: 1,
};

const mockUsuario: IUsuario = {
  id: 1,
  nome: 'Usuário Teste',
  email: 'usuario@gmail.com',
};

describe('PessoaService', () => {
  let service: PessoaService;
  let repository: Repository<Pessoa>;
  let grpcUsuarioService: ClientGrpc;
  let mailService: ClientProxy;
  let exportPdfService: ExportPdfService;

  beforeEach(async () => {
    grpcUsuarioService = {
      getService: jest.fn().mockReturnValue({
        FindOne: jest.fn(),
      }),
    } as unknown as ClientGrpc;

    mailService = {
      emit: jest.fn(),
    } as unknown as ClientProxy;

    exportPdfService = {
      export: jest.fn(),
    } as unknown as ExportPdfService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoaService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: 'GRPC_USUARIO',
          useValue: grpcUsuarioService,
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: mailService,
        },
        {
          provide: ExportPdfService,
          useValue: exportPdfService,
        },
      ],
    }).compile();

    service = module.get<PessoaService>(PessoaService);
    repository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pessoa', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockPessoa);
      const response = await service.create(mockCreatePessoaDto);
      expect(response).toEqual(mockPessoa);
    });
  });

  describe('findAll', () => {
    it('should return a list of pessoas', async () => {
      const mockListaPessoa = [mockPessoa];
      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([mockListaPessoa, mockListaPessoa.length]);
      const response = await service.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );
      expect(response.data).toEqual(mockListaPessoa);
      expect(response.count).toEqual(mockListaPessoa.length);
    });
  });

  describe('findOne', () => {
    it('should return a pessoa', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockPessoa);
      const response = await service.findOne(mockPessoa.id);
      expect(response).toEqual(mockPessoa);
    });
  });

  describe('update', () => {
    it('should update a pessoa', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockPessoa);
      const response = await service.update(
        mockUpdatePessoaDto.id,
        mockUpdatePessoaDto,
      );
      expect(response).toEqual(mockUpdatePessoaDto);
    });

    it('should throw an error when ids are different', async () => {
      await expect(service.update(2, mockUpdatePessoaDto)).rejects.toThrow(
        new HttpException(EMensagem.IDS_DIFERENTES, HttpStatus.NOT_ACCEPTABLE),
      );
    });
  });

  describe('unactivate', () => {
    it('should unactivate a pessoa', async () => {
      const findedPessoa = Object.assign(mockPessoa, { ativo: true });
      jest.spyOn(repository, 'findOne').mockResolvedValue(findedPessoa);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(Object.assign(findedPessoa, { ativo: false }));
      const response = await service.unactivate(findedPessoa.id);
      expect(response).toBe(false);
    });

    it('should throw an error when pessoa is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.unactivate(mockPessoa.id)).rejects.toThrow(
        new HttpException(
          EMensagem.IMPOSSIVEL_DESATIVAR,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      );
    });
  });

  describe('exportPdf', () => {
    it('should export PDF and send email', async () => {
      jest
        .spyOn(service, 'getUsuarioFromGrpc')
        .mockReturnValue(Promise.resolve(mockUsuario));

      const mockListaProdutos = [mockPessoa];
      jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve(mockListaProdutos));

      const mockFilePath = '/tmp/export';
      jest
        .spyOn(exportPdfService, 'export')
        .mockReturnValue(Promise.resolve(mockFilePath));

      jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .spyOn(require('fs'), 'readFileSync')
        .mockReturnValue(Buffer.from('dummy base64 content'));

      const result = await service.exportPdf(
        1,
        mockFindAllOrder,
        mockFindAllFilter,
      );

      expect(result).toBe(true);
      expect(exportPdfService.export).toHaveBeenCalled();
      expect(mailService.emit).toHaveBeenCalled();
    });

    it('should throw an error when user is not found', async () => {
      const mockUsuarioNotFound = Object.assign(mockUsuario, { id: 0 });

      jest
        .spyOn(service, 'getUsuarioFromGrpc')
        .mockReturnValue(Promise.resolve(mockUsuarioNotFound));

      try {
        await service.exportPdf(1, mockFindAllOrder, mockFindAllFilter);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ERRO_EXPORTAR_PDF);
      }
    });

    it('should throw an error when there is an error exporting PDF', async () => {
      jest
        .spyOn(service, 'getUsuarioFromGrpc')
        .mockReturnValue(Promise.resolve(mockUsuario));

      jest
        .spyOn(repository, 'find')
        .mockReturnValue(Promise.resolve([mockPessoa]));

      jest
        .spyOn(exportPdfService, 'export')
        .mockRejectedValue(new Error('Export error'));

      try {
        await service.exportPdf(1, mockFindAllOrder, mockFindAllFilter);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.ERRO_EXPORTAR_PDF);
      }
    });
  });
});
