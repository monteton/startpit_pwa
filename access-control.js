(function() {
    // Получаем дату первого входа (в миллисекундах)
    var firstAccess = localStorage.getItem('app_first_access_date');
    var now = new Date().getTime();
    
    // Количество дней для доступа
    var maxDays = 60;
    
    if (!firstAccess) {
        // Если пользователь зашел впервые, сохраняем текущую дату
        localStorage.setItem('app_first_access_date', now.toString());
    } else {
        // Считаем, сколько дней прошло с первого захода
        var diffTime = now - parseInt(firstAccess, 10);
        var daysPassed = diffTime / (1000 * 60 * 60 * 24);
        
        if (daysPassed > maxDays) {
            // Если прошло больше 60 дней, перенаправляем на страницу блокировки
            // Проверяем, что мы уже не на ней, чтобы не было бесконечного цикла
            if (!window.location.pathname.endsWith('expired.html')) {
                window.location.href = 'expired.html';
            }
        }
    }
})();
