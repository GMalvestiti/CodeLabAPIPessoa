import { Test, TestingModule } from '@nestjs/testing';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';
import { PessoaController } from './pessoa.controller';
import { PessoaService } from './pessoa.service';

const mockCreatePessoaDto: CreatePessoaDto = {
  nome: 'Pessoa de Teste',
  documento: '12345678901',
  cep: '12345678',
  endereco: 'Rua de Teste, 123',
  telefone: '11987654321',
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

describe('PessoaController', () => {
  let controller: PessoaController;
  let service: PessoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoaController],
      providers: [
        {
          provide: PessoaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            unactivate: jest.fn(),
            exportPdf: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PessoaController>(PessoaController);
    service = module.get<PessoaService>(PessoaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pessoa', async () => {
      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.create(mockCreatePessoaDto);

      expect(response).toBeInstanceOf(HttpResponse);
      expect(response.message).toEqual(EMensagem.SALVO_SUCESSO);
      expect(response.data).toEqual(mockPessoa);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of pessoas', async () => {
      const mockListaPessoas: Pessoa[] = [mockPessoa];

      const spyServiceFindAll = jest.spyOn(service, 'findAll').mockReturnValue(
        Promise.resolve({
          data: mockListaPessoas,
          count: mockListaPessoas.length,
        }) as any,
      );

      const response = await controller.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );

      expect(response.data).toEqual(mockListaPessoas);
      expect(response.count).toEqual(mockListaPessoas.length);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a pessoa', async () => {
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.findOne(1);

      expect(spyServiceFindOne).toHaveBeenCalled();
      expect(response.data).toEqual(mockPessoa);
    });
  });

  describe('update', () => {
    it('should update a pessoa', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockPessoa) as any);

      const response = await controller.update(
        mockUpdatePessoaDto.id,
        mockUpdatePessoaDto,
      );

      expect(spyServiceUpdate).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.ATUALIZADO_SUCESSO);
      expect(response.data).toEqual(mockPessoa);
    });
  });

  describe('unactivate', () => {
    it('should unactivate a pessoa', async () => {
      const spyServiceUnactivate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.unactivate(mockUpdatePessoaDto.id);

      expect(spyServiceUnactivate).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.DESATIVADO_SUCESSO);
      expect(response.data).toEqual(true);
    });
  });

  describe('exportPdf', () => {
    it('should export pdf', async () => {
      const spyServiceExportPdf = jest
        .spyOn(service, 'exportPdf')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.exportPdf(
        1,
        mockFindAllOrder,
        mockFindAllFilter,
      );

      expect(spyServiceExportPdf).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.INICIADA_GERACAO_PDF);
      expect(response.data).toEqual(true);
    });
  });
});
