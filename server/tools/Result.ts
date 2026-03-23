export function Response(data: any, status = 200, mes = "success") {
    return {
        timestamp: Date.now(),
        message: mes,
        status: status,
        data: data
    };
}