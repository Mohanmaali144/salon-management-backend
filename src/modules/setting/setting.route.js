import express from 'express';
import {
    getSettings,
    updateSettings,
    deleteSettings,
    permanentDeleteSettings
} from './setting.controller.js';


const router = express.Router();


router.get('/', getSettings);


router.post('/', updateSettings);


router.delete('/', deleteSettings);

router.delete('/', permanentDeleteSettings);

export default router;