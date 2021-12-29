const data = require('./data.json')

function objectToTree(obj) {
    function indentPrint(obj, nameIndent, itemsIndent) {
        let ret = nameIndent + obj.name + '\n'

        obj.items?.forEach((el, index) => {
            const isLastElement = (index === obj.items.length - 1)
            ret += indentPrint(
                el,
                itemsIndent + (isLastElement ? '└── ' : '├── '),
                itemsIndent + (isLastElement ? '    ' : '|   ')
            )
        })

        return ret
    }
    
    return indentPrint(obj, '', '')
}

console.log(objectToTree(data))
