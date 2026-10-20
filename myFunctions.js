(function () {
  "use strict";

  function arabicNameIsValid(value) {
    return value === "" || /^[ء-ي\s]+$/.test(value);
  }

  function nationalIdIsValid(value) {
    return /^(0[1-9]|1[0-4])[0-9]{9}$/.test(value);
  }

  function mobileIsValid(value) {
    return value === "" || /^(090|093|094|095|096|098|099)[0-9]{7}$/.test(value);
  }

  function emailIsValid(value) {
    return value === "" || /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  }

  function dateDifference(start, end) {
    var startDate = new Date(start + "T00:00:00");
    var endDate = new Date(end + "T00:00:00");
    return Math.round((endDate - startDate) / 86400000);
  }

  function selectedCars() {
    var cars = [];
    $(".car-select:checked").each(function () {
      var row = $(this).closest("tr");
      cars.push({
        code: $.trim(row.children().eq(0).text()),
        model: $.trim(row.children().eq(1).text()),
        price: Number(row.children().eq(3).text().replace(/[^0-9]/g, ""))
      });
    });
    return cars;
  }

  function money(value) {
    return value.toLocaleString("ar-SY") + " ل.س";
  }

  function showErrors(errors) {
    var html = "<strong>يرجى تصحيح الأخطاء التالية:</strong><ul>";
    for (var i = 0; i < errors.length; i += 1) { html += "<li>" + errors[i] + "</li>"; }
    html += "</ul>";
    $("#formErrors").html(html).removeClass("hidden");
    $("#bookingResult").addClass("hidden");
  }

  function validateForm() {
    var errors = [];
    var name = $.trim($("#fullName").val());
    var id = $.trim($("#nationalId").val());
    var start = $("#startDate").val();
    var end = $("#endDate").val();
    var mobile = $.trim($("#mobile").val());
    var email = $.trim($("#email").val());
    if (!arabicNameIsValid(name)) { errors.push("الاسم يجب أن يحتوي على أحرف عربية ومسافات فقط."); }
    if (!nationalIdIsValid(id)) { errors.push("الرقم الوطني يجب أن يتكون من 11 خانة وأن يبدأ برمز محافظة من 01 إلى 14."); }
    if (start === "") { errors.push("تاريخ بداية التأجير إلزامي."); }
    if (end === "") { errors.push("تاريخ نهاية التأجير إلزامي."); }
    if (start !== "" && end !== "" && dateDifference(start, end) <= 0) { errors.push("يجب أن يكون تاريخ النهاية لاحقًا لتاريخ البداية."); }
    if (!mobileIsValid(mobile)) { errors.push("رقم الموبايل يجب أن يبدأ ببادئة سورية معتمدة (090 أو 093 أو 094 أو 095 أو 096 أو 098 أو 099) ويتكون من 10 أرقام."); }
    if (!emailIsValid(email)) { errors.push("البريد الإلكتروني غير صحيح. أدخل عنوانًا مثل name@example.com."); }
    return { errors: errors, days: (start !== "" && end !== "") ? dateDifference(start, end) : 0 };
  }

  function renderBookingResult(cars, days) {
    var discount = days > 7 ? 0.10 : 0;
    var total = 0;
    var html = "<h3>تم استلام طلب الحجز بنجاح</h3><p>السيارات المختارة ومدة التأجير:</p><table class=\"result-table\"><thead><tr><th>السيارة</th><th>عدد الأيام</th><th>المبلغ</th></tr></thead><tbody>";
    for (var i = 0; i < cars.length; i += 1) {
      var amount = cars[i].price * days * (1 - discount);
      total += amount;
      html += "<tr><td>" + cars[i].code + " - " + cars[i].model + "</td><td>" + days + "</td><td>" + money(amount) + "</td></tr>";
    }
    html += "</tbody></table><p>الخصم: " + (discount * 100) + "% " + (discount ? "(لأن المدة تتجاوز 7 أيام)" : "") + "</p><p class=\"total\">المبلغ الإجمالي: " + money(total) + "</p>";
    $("#bookingResult").html(html).removeClass("hidden");
    $("#formErrors").addClass("hidden");
  }

  if (typeof window.jQuery !== "undefined") {
    $(function () {
    $(".details-toggle").on("change", function () {
      $(this).closest("tr").next(".details-row").stop(true, true).slideToggle(220);
    });

    $("#continueButton").on("click", function () {
      var cars = selectedCars();
      if (cars.length === 0) {
        $("#selectionMessage").text("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
        $("#bookingSection").addClass("hidden");
        return;
      }
      $("#selectionMessage").text("تم اختيار " + cars.length + " سيارة. أكمل بيانات الحجز أدناه.");
      $("#bookingSection").removeClass("hidden");
      $("#bookingSection").get(0).scrollIntoView({ behavior: "smooth" });
    });

    $("#bookingForm").on("submit", function (event) {
      event.preventDefault();
      var checked = selectedCars();
      var result = validateForm();
      if (checked.length === 0) { result.errors.push("يجب اختيار سيارة واحدة على الأقل."); }
      if (result.errors.length > 0) { showErrors(result.errors); return; }
      renderBookingResult(checked, result.days);
    });
    });
  }
}());
