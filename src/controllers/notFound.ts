import { Request, Response } from 'express';

export default (req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    errors: [
      {
        value: `${req.method}|${req.path}`,
        param: '',
        location: 'url',
        msg: 'url no avalible',
      },
    ],
  });
};
