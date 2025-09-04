const express = require('express');
const { getPlans, addPlan, updatePlan, deletePlan } = require('../controller/plan');
const { verifyToken } = require('../middleware/authValidation');
const planRouter = express.Router();

planRouter.get('/', getPlans)

planRouter.get('/:id', getPlans)

planRouter.post('/add', verifyToken, addPlan)

planRouter.put('/:id', verifyToken, updatePlan)

planRouter.delete('/:id', verifyToken, deletePlan)

module.exports = planRouter