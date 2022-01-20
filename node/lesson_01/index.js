const data = require('./data.json')

function objectToTree(obj) {
    function indentPrint(obj, nameIndent, itemsIndent) {
        console.log(nameIndent + obj.name)

        obj.items?.forEach((el, index) => {
            const isLastElement = (index === obj.items.length - 1)
            indentPrint(
                el,
                itemsIndent + (isLastElement ? '└── ' : '├── '),
                itemsIndent + (isLastElement ? '    ' : '|   ')
            )
        })
    }
    
    indentPrint(obj, '', '')
}

objectToTree(data)
