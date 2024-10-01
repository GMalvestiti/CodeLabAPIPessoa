import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PessoaController } from '../src/core/pessoa/pessoa.controller';
import { PessoaService } from '../src/core/pessoa/pessoa.service';
import { CreatePessoaDto } from '../src/core/pessoa/dto/create-pessoa.dto';
import { UpdatePessoaDto } from '../src/core/pessoa/dto/update-pessoa.dto';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { IFindAllOrder } from 'src/shared/interfaces/find-all-order.interface';
import { IFindAllFilter } from 'src/shared/interfaces/find-all-filter.interface';

describe('PessoaController (e2e)', () => {
  let controller: PessoaController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: PessoaService;

  const mockPessoaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    unactivate: jest.fn(),
    exportPdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoaController],
      providers: [
        {
          provide: PessoaService,
          useValue: mockPessoaService,
        },
      ],
    }).compile();

    controller = module.get<PessoaController>(PessoaController);
    service = module.get<PessoaService>(PessoaService);
  });

  it('should create a person', async () => {
    const createPessoaDto: CreatePessoaDto = {
      nome: 'Jane Doe',
      documento: '12345678901',
      cep: '12345-678',
      endereco: '123 Main St',
      telefone: '123456789',
      ativo: true,
    };

    const expectedResponse = { id: 1, ...createPessoaDto };
    mockPessoaService.create.mockResolvedValue(expectedResponse);

    await controller.create(createPessoaDto);
    expect(mockPessoaService.create).toHaveBeenCalled();
  });

  it('should find all persons', async () => {
    const page = 0;
    const size = 10;
    const order: IFindAllOrder = { column: 'id', sort: 'asc' };
    const filter: IFindAllFilter = { column: 'id', value: 1 };

    const expectedResponse = { data: [], count: 0 };
    mockPessoaService.findAll.mockResolvedValue(expectedResponse);

    const result = await controller.findAll(page, size, order, filter);
    expect(result).toEqual(expect.objectContaining(expectedResponse));
    expect(mockPessoaService.findAll).toHaveBeenCalledWith(
      page,
      size,
      order,
      filter,
    );
  });

  it('should find a person by id', async () => {
    const id = 1;
    const expectedResponse = { id, nome: 'Jane Doe', documento: '12345678901' };
    mockPessoaService.findOne.mockResolvedValue(expectedResponse);

    const result = await controller.findOne(id);
    expect(result).toEqual({ data: expectedResponse });
    expect(mockPessoaService.findOne).toHaveBeenCalledWith(id);
  });

  it('should update a person', async () => {
    const id = 1;
    const updatePessoaDto: UpdatePessoaDto = {
      id,
      nome: 'Jane Doe Updated',
      documento: '12345678901',
      cep: '12345-678',
      endereco: '456 Main St',
      telefone: '987654321',
      ativo: true,
    };
    const expectedResponse = { id, ...updatePessoaDto };
    mockPessoaService.update.mockResolvedValue(expectedResponse);

    await controller.update(id, updatePessoaDto);
    expect(mockPessoaService.update).toHaveBeenCalled();
  });

  it('should deactivate a person', async () => {
    const id = 1;
    mockPessoaService.unactivate.mockResolvedValue(true);

    const result = await controller.unactivate(id);
    expect(result).toEqual(
      expect.objectContaining({
        data: true,
        message: EMensagem.DESATIVADO_SUCESSO,
      }),
    );
    expect(mockPessoaService.unactivate).toHaveBeenCalledWith(id);
  });

  it('should throw error if person not found', async () => {
    const id = 1;
    mockPessoaService.findOne.mockRejectedValue(
      new HttpException('Person not found', HttpStatus.NOT_FOUND),
    );

    await expect(controller.findOne(id)).rejects.toThrow(HttpException);
    expect(mockPessoaService.findOne).toHaveBeenCalledWith(id);
  });

  it('should export PDF', async () => {
    const idUsuario = 1;
    const order: IFindAllOrder = { column: 'id', sort: 'asc' };
    const filter: IFindAllFilter = { column: 'id', value: 1 };
    mockPessoaService.exportPdf.mockResolvedValue(true);

    const result = await controller.exportPdf(idUsuario, order, filter);
    expect(result).toEqual(
      expect.objectContaining({
        data: true,
        message: EMensagem.INICIADA_GERACAO_PDF,
      }),
    );
    expect(mockPessoaService.exportPdf).toHaveBeenCalledWith(
      idUsuario,
      order,
      filter,
    );
  });
});
