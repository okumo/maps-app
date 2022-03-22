

export const getUserLocation = async():Promise<[number, number]>=>{
    console.log("getuserlocation")
    return new Promise( (resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(
            ({coords})=>{
                resolve([coords.longitude, coords.latitude])
            },
            (err)=>{
                alert('No se puede obtener la geolocalización');
                console.log(err)
                reject();
            }
        )
    })
}