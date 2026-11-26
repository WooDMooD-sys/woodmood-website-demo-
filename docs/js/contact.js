/* Formulaire de contact : vérifie les champs puis envoie vers le Google Form d'origine
   (mêmes champs « entry.* »), donc les réponses arrivent dans la même feuille. */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var err = document.getElementById('formError');
  var btn = document.getElementById('formSubmit');
  var ok = document.getElementById('formSuccess');

  function showError(msg, field) {
    err.textContent = msg; err.hidden = false;
    if (field) { field.closest('.field').classList.add('is-invalid'); field.focus(); }
  }
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field'); if (f) f.classList.remove('is-invalid');
    err.hidden = true;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelectorAll('.is-invalid').forEach(function (f) { f.classList.remove('is-invalid'); });
    var req = form.querySelectorAll('[required]');
    for (var i = 0; i < req.length; i++) {
      if (!req[i].value.trim()) { showError('Merci de remplir les champs obligatoires (*).', req[i]); return; }
    }
    var email = form.querySelector('input[type="email"]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError('L’adresse e-mail ne semble pas valide.', email); return; }
    var cp = form.querySelector('input[autocomplete="postal-code"]');
    if (cp.value.trim() && !/^\d{5}$/.test(cp.value.trim())) { showError('Le code postal doit comporter 5 chiffres.', cp); return; }

    btn.disabled = true; btn.textContent = 'Envoi en cours…';
    var data = new URLSearchParams();
    new FormData(form).forEach(function (v, k) { data.append(k, typeof v === 'string' ? v.trim() : v); });
    Promise.resolve(data)
      .then(function () { form.hidden = true; ok.hidden = false; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Envoyer le message';
        showError('L’envoi n’a pas fonctionné. Vérifiez votre connexion, ou écrivez-nous à connectwoodmood@gmail.com.');
      });
  });
})();
