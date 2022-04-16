import { models } from '../db'
import {
	Request,
	Response,
	NextFunction
} from 'express'

const {
	Exercise,
	Program
} = models

const filterExercise = () => async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const programID = parseInt(req.query.programID);
    const search = req.query.search;
    const model = await Exercise.findAll({ paranoid: false,
        include: [{
            model: Program,
            as: 'program'
        }]
    });
    
    if(search){
        var searchByName = Array();
        model.forEach(element => {
            if (element.name.includes(search)){
                searchByName.push(element)
            }
        });
        req.search = searchByName
    }
    if(page && limit){
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
    
        const results = {};
        if (endIndex < model.length) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }
   
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }
   
        results.results = model.slice(startIndex, endIndex);
    
        req.paginatedExercises = results;
    }
    if(programID){
        const idResult = await Exercise.findAll({ where: {programID: programID} });
        req.progarmIDExercise = idResult;
    }

    req.exercises = model;

    return next()
    
}

export {filterExercise}