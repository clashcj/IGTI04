import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let grade = req.body;

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      grade.value == null
    ) {
      throw new Error('Falta campos obrigatórios.');
    }

    const data = JSON.parse(await readFile(global.fileNameGrades));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.fileNameGrades, JSON.stringify(data, null, 2));

    res.send(grade);

    loggerGrades.info('POST /grades - ' + JSON.stringify(grade));
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    delete data.nextId;
    res.send(data);
    loggerGrades.info('GET /grades');
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    const grade = data.grades.find((grade) => grade.id == req.params.id);
    res.send(grade);
    loggerGrades.info('GET /grades/:id');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    data.grades = data.grades.filter((grade) => grade.id != req.params.id);
    await writeFile(global.fileNameGrades, JSON.stringify(data, null, 2));

    res.end();
    loggerGrades.info('DELETE /grades/:id - ' + req.params.id);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    let grade = req.body;

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      grade.value == null
    ) {
      throw new Error('Falta campos obrigatórios.');
    }

    const data = JSON.parse(await readFile(global.fileNameGrades));
    const index = data.grades.findIndex((g) => g.id === grade.id);

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;

    await writeFile(global.fileNameGrades, JSON.stringify(data, null, 2));
    res.send(grade);

    loggerGrades.info('PUT /grade - ' + JSON.stringify(grade));
  } catch (err) {
    next(err);
  }
});

router.get('/total/:student/:subject', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    const grades = data.grades.filter(
      (grade) =>
        grade.student == req.params.student &&
        grade.subject == req.params.subject
    );

    const soma = grades.reduce((acc, cur) => {
      return acc + cur.value;
    }, 0);

    res.send({ soma: soma });
    loggerGrades.info('GET /grades/total/:student/:subject');
  } catch (err) {
    next(err);
  }
});

router.get('/mean/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    const grades = data.grades.filter(
      (grade) =>
        grade.subject == req.params.subject && grade.type == req.params.type
    );
    const soma = grades.reduce((acc, cur) => {
      return acc + cur.value;
    }, 0);
    var media = soma / grades.length;

    res.send({ media: media });
    loggerGrades.info('GET /grades/mean/:subject/:type');
  } catch (err) {
    next(err);
  }
});

router.get('/topThree/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileNameGrades));
    const grades = data.grades
      .filter(
        (grade) =>
          grade.subject == req.params.subject && grade.type == req.params.type
      )
      .sort((a, b) => {
        return b.value - a.value;
      })
      .slice(0, 3);

    res.send(grades);
    loggerGrades.info('GET /grades/topThree/:subject/:type');
  } catch (err) {
    next(err);
  }
});

export default router;
