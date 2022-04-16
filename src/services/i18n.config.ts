import path from 'path'
const { I18n } = require('i18n')

const i18n = new I18n({
    locales: ['en', 'sk'],
    directory: path.join(__dirname, '../locales')
})

export { i18n };