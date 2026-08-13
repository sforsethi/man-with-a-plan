const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  reveals.forEach((element) => observer.observe(element));
}

const questionnaire = document.querySelector('#client-questionnaire');
const questionnaireForm = document.querySelector('#questionnaire-form');
const openQuestionnaireButtons = document.querySelectorAll('[data-open-questionnaire]');
const closeQuestionnaire = document.querySelector('[data-close-questionnaire]');

function setQuestionnaireOpen(isOpen) {
  document.body.classList.toggle('questionnaire-open', isOpen);
  if (isOpen) questionnaire.showModal();
  else questionnaire.close();
}

openQuestionnaireButtons.forEach((button) => {
  button.addEventListener('click', () => setQuestionnaireOpen(true));
});
closeQuestionnaire?.addEventListener('click', () => setQuestionnaireOpen(false));
questionnaire?.addEventListener('close', () => document.body.classList.remove('questionnaire-open'));
questionnaire?.addEventListener('click', (event) => {
  if (event.target === questionnaire) setQuestionnaireOpen(false);
});

questionnaireForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const answer = (name) => data.get(name)?.toString().trim() || 'Not shared';
  const answers = (name) => data.getAll(name).map(String).join(', ') || 'Not shared';
  const names = answer('names');
  const subject = `MWP Client Questionnaire — ${names}`;
  const body = [
    'CLIENT QUESTIONNAIRE',
    'LET’S CREATE SOMETHING WORTH REMEMBERING.',
    '',
    `1. What should we call you?\n${names}`,
    '',
    `2. Who are we creating this for?\n${answer('creating_for')}`,
    '',
    `3. How can we reach you?\nPhone: ${answer('phone')}\nEmail: ${answer('email')}`,
    '',
    `4. Where are you based?\n${answer('based_in')}`,
    '',
    `5. What are you planning?\n${answer('planning')}`,
    '',
    `6. What stage are you at right now?\n${answer('stage')}`,
    '',
    `7. How many people are we creating this experience for?\n${answer('guest_count')}`,
    '',
    `8. Where do you see it happening?\n${answer('destination')}`,
    '',
    `9. Do you already have a venue?\n${answer('venue_status')}\nVenue: ${answer('venue_name')}`,
    '',
    `10. What is one thing you definitely don’t want?\n${answer('definitely_not')}`,
    '',
    `11. What are you drawn to?\n${answers('drawn_to')}`,
    '',
    `12. What are you looking for from us?\n${answers('services')}`,
    '',
    `13. How involved do you want to be?\n${answer('involvement')}`,
    '',
    `14. How did you find us?\n${answer('found_us')}\nOther: ${answer('found_us_other')}`,
  ].join('\n');

  window.location.href = `mailto:hello@manwithaplan.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
