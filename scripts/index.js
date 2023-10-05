
const ASSET = {
    adq_date: {},
    sell_date: {},
    opt_date: {},
    last_period: {},
    moi: 0,
    depreciation: 0,
    book_value: 0,
    sellPrice: 0,
    gain_lose: 0,
    inpcAdq: 0,
    option: false,
    factor:0,
    calculate(){
        let fact=Number((this.last_period.index / this.inpcAdq).toFixed(4))
        this.factor = fact;
    }   


}

const validateValue = (value)=>{
    return value > 0? true:false;
}


const calculateBookValue = (id, value) => {
    let elementId = id;
    let elementValue = value;
    let isValid= validateValue(value);

    switch (elementId) {
        case 'moi':            
            isValid? ASSET.moi = elementValue:document.getElementById(id).value = 0;
            break;
        case 'accDep':
            isValid? ASSET.depreciation = elementValue:document.getElementById(id).value = 0;
            break;
        case 'sellPrice':
            isValid? ASSET.sellPrice = elementValue:document.getElementById(id).value = 0;
            break;    
    
        default:
            break;
    }
    let bookValue = document.getElementById('bookValue');
    let netValue = ASSET.moi - ASSET.depreciation;
    ASSET.book_value = netValue;
    bookValue.value = netValue;
    let result = document.getElementById('result');
    let gainLose = ASSET.sellPrice - ASSET.book_value;
    ASSET.gain_lose = gainLose
    result.value = ASSET.gain_lose;
    let label = document.querySelector("label[for='result']");
    gainLose >= 0 ? label.innerHTML = 'Ganancia' : label.innerHTML = 'Perdida';
}

//FUNCIONES QUE SE EJECUTARAN AL CLICK DE BOTTON CALCULAR
const getDate = async (id, value) => {
    let month, year;

    if (id === 'adqDate') {
        month = Number(value.substring(5, 7))
        year = Number(value.substring(0, 4))
        let json = await getInpc(month, year)
        ASSET.inpcAdq = Number((json.data).toFixed(4));
        ASSET.adq_date.date=value
        ASSET.adq_date.month = month
        ASSET.adq_date.year = year
    } else if (id === 'dispDate') {
        month = Number(value.substring(5, 7))
        year = Number(value.substring(0, 4))
        ASSET.sell_date.date= value;
        ASSET.sell_date.month = month;
        ASSET.sell_date.year = year;
    }
    else {

        ASSET.opt_date.month = Number(value);
        ASSET.opt_date.year = ASSET.sell_date.year;
    }


}

async function getInpc(month, year) {

    let jsonData = { month, year }
    let url = 'http://localhost:3000/getInpc';
    let init = {
        method: 'POST',
        body: JSON.stringify(jsonData),
        cache: 'default',
        headers: { 'Content-Type': 'application/json', }
    };
    let response = await fetch(url, init);
    let json = await response.json();
    return json


};

//HIDE OR SHOW THE OPTION FIELDSET
document.addEventListener('click', (e) => {
    let selection = e.target.value;
    let element = document.getElementById('fieldOpt');
    if (selection === 'yes') {
        element.style.display = 'none'
        ASSET.inpcOpt = 0;
        ASSET.option = false
    }
    else if (selection === 'no') {
        element.style.display = 'flex'
        ASSET.option = true
    }


})



function Render() {
    
    let root = document.getElementById('summary');
    root.innerHTML = `
    Resultado:
    <div class='summary'>
        <textarea name="" id="" cols="2" rows="20" disabled>
        Fecha de adquisicion: ${ASSET.adq_date.date}
        Fecha de venta: ${ASSET.sell_date.date}
        Ultimo periodo de uso: ${ASSET.last_period.month} / ${ASSET.last_period.year} 
        INPC fecha de adquisicion: ${ASSET.inpcAdq}
        INPC ultimo mes de 1a. mitad del periodo de uso: ${ASSET.last_period.index}
        Factor de actualizacion: ${ASSET.factor}
        ------Calculo Contable-------
        Monto original de la inversion: ${ASSET.moi}
        Depreciacion Acumulada: ${ASSET.depreciation}
        Valor en libros: ${ASSET.book_value}
        Valor de Venta del activo: ${ASSET.sellPrice}
        Ganancia o perdida contable: ${ASSET.sellPrice-ASSET.book_value}
        ------Calculo Fiscal --------
        Valor de Venta del activo: ${ASSET.sellPrice}
        Valor en libros actualizado: ${(ASSET.book_value * ASSET.factor).toFixed(2)}
        Ganancia o perdida fiscal: ${(ASSET.sellPrice - ((ASSET.book_value * ASSET.factor)).toFixed(2)).toFixed(2)}

        </textarea>
    `
    
    

}




const getIndex = async () => {
    ASSET.option === false ? getLastPeriod(ASSET.adq_date, ASSET.sell_date) : getLastPeriod(ASSET.adq_date, ASSET.opt_date);
    try {
        let index = await getInpc(ASSET.last_period.month, ASSET.last_period.year)
        //Almacena el indice en el objeto
        ASSET.last_period.index = Number(index.data.toFixed(4));
        //Ejecuta metodo que calcula y almacen el factor de actualizacion dentro del objeto ASSET
        ASSET.calculate();
        Render()
    } catch (error) {
        console.log(error)
    }


}
//Determina el ultimo periodo de uso
function getLastPeriod(dateRef1, dateRef2) {
    let firstHalfMonth;
    let firstHalfYear;
    let isSame = dateRef1.year === dateRef2.year;
    if (isSame) {
        //determinar el ultimo mes de la primera mitad del periodo de uso
        let reference = (dateRef2.month - dateRef1.month) / 2
        
        if (reference <= 1) firstHalfMonth = dateRef1.month;
        else if (reference <= 2) firstHalfMonth = dateRef1.month + 1;
        else if (reference <= 3) firstHalfMonth = dateRef1.month + 2;
        else if (reference <= 4) firstHalfMonth = dateRef1.month + 3;
        else if (reference <= 5) firstHalfMonth = dateRef1.month + 4;
        else firstHalfMonth = dateRef1.month + 5;

    } else {
        let reference = dateRef2.month / 2
        
        reference <= 1 ? firstHalfMonth = 1 : firstHalfMonth = Math.floor(dateRef2.month / 2);
    }
    firstHalfYear = dateRef2.year
    
    ASSET.last_period.month = firstHalfMonth
    ASSET.last_period.year = firstHalfYear
    return [firstHalfMonth, firstHalfYear];
}


const validateData = () => {
    let fields = ['adqDate', 'dispDate', 'select', 'moi', 'accDep', 'sellPrice'];
    let isComplete = true
    
    fields.forEach(field => {
        let id = document.getElementById(field).value;
        
        if (id === '') isComplete = false
    })
    
    let dateAdq = document.getElementById('adqDate').value;
    let dateSell = document.getElementById('dispDate').value;
    if (dateSell < dateAdq){
        alert("la fecha de la venta no puede ser menor a la fecha de adquisicion");
        return
    }
    if (ASSET.opt_date.year === ASSET.adq_date.year) {
        if (ASSET.adq_date.month > ASSET.opt_date.month) return alert("El mes del ultimo periodo de uso no puede ser menor al mes de adquisicion");
    }
    isComplete ? getIndex() : alert('alguno de los campos esta vacio') 
}

let button = document.getElementById('calculate');
button.addEventListener('click', validateData)
