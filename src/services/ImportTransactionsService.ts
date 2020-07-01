import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const lines = await this.loadCSV(filePath);

    const createTransaction = new CreateTransactionService();
    // const transactions = Promise.all(
    //   lines.map(async line => {
    //     const { title, type, value, category } = line;
    //     const transaction = await createTransaction.execute({
    //       title,
    //       value,
    //       type,
    //       category,
    //     });
    //     return transaction;
    //   }),
    // );
    const transactions: Transaction[] = [];
    for (let i = 0; i < lines.length; i++) {
      const { title, type, value, category } = lines[i];
      const transaction = await createTransaction.execute({
        title,
        value,
        type,
        category,
      });
      transactions.push(transaction);
    }

    return transactions;
  }

  private async loadCSV(filePath: string): Promise<CSVLine[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: CSVLine[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

interface CSVLine {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

export default ImportTransactionsService;
