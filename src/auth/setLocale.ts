import { eq } from 'sequelize/types/lib/operators'
import { i18n } from '../i18n.config'

const setLang = () => (req,res,next) => {
    console.log(req.get('language'))

    if (req.get('language') !== undefined) {
        i18n.setLocale(req.get('language'))
    }		
    else{
        i18n.setLocale(req,'en')
    }
    
    req.i18n = i18n
    return next()
}

export {setLang}