'use strict';

var winnerElm            = document.getElementById('winner');
var checkWinnerBtnElm    = document.getElementById('check-winner');
var registrationFormElm  = document.getElementById('registration-form');
var participantsTableElm = document.getElementById('participants');

var Storage = function(name) {
  var self = this;
  this._currentElem = {};

  this._savetStorage = function(storage) {
    localStorage.setItem(name, JSON.stringify(storage));
  };

  this.getStorage = function() {
    return JSON.parse(localStorage.getItem(name)) || {};
  };

  this.getElem = function(id) {
    var storage = self.getStorage();
    return storage[id];
  };

  this.getCount = function() {
    return Object.keys(self.getStorage()).length;
  };

  this.setCurrentElem = function(elem) {
    self._currentElem = {
      _id:      elem['_id'] || self.getCount() + 1,
      name:     elem['name'],
      surname:  elem['surname'],
      email:    elem['email'],
      phone:    elem['phone'],
      birthday: elem['birthday'],
    };
    return self;
  };

  this.getCurrentElem = function() {
    return this._currentElem;
  };

  this.saveCurrentElem = function(id, newElem) {
    var storage = self.getStorage();
    var id = self._currentElem['_id'];
    storage[id] = self._currentElem;
    self._savetStorage(storage);
  };

  this.removeElem = function(id) {
    var storage = self.getStorage();
    self.setCurrentElem(storage[id]);
    delete storage[id];
    self._savetStorage(storage);
  };

}

var participantsStorage = new Storage('participants');

var changeForm = new Event('changeForm');
var resetForm = new Event('resetForm');
var changeTable = new Event('changeTable');
var removeRowTable = new Event('removeRowTable');

var changeFormHandler = function(ev) {
  var elements = this.elements;
  var participant = participantsStorage.getCurrentElem();
  Object.keys(participant).forEach(function(key) {
    elements[key].value = participant[key];
  });
}
var resetFormHandler = function(ev) {
  var elements = this.elements;
  var fields = ['_id', 'name', 'surname', 'email', 'phone', 'birthday'];
  fields.forEach(function(field) {
    elements[field].value = '';
  });
}
var saveFormHandler = function(ev) {
  ev.preventDefault();
  var phonePatt = /[0-9]{10}/;
  var elements = this.elements;
  var value;
  var mistakes = ['name', 'surname', 'email', 'phone'].filter(function(field) {
    value = elements[field].value;
    if (elements[field].id != 'phone' && !value) {
      elements[field].parentElement.classList.add('has-error');
      return 1;
    } else if (elements[field].id == 'phone' && value) {
      if (!phonePatt.test(value)) {
        elements[field].parentElement.classList.add('has-error');
        return 1;
      } else {
        elements[field].parentElement.classList.remove('has-error');
      }
    } else {
      elements[field].parentElement.classList.remove('has-error');
    }
  })
  if (mistakes.length > 0) {
    return false;
  }
  participantsStorage.setCurrentElem({
    _id: elements['_id'].value,
    name: elements['name'].value,
    surname: elements['surname'].value,
    email: elements['email'].value,
    phone: elements['phone'].value,
    birthday: elements['birthday'].value
  }).saveCurrentElem();
  document.getElementById('participants').tBodies[0].dispatchEvent(changeTable);
  this.dispatchEvent(resetForm);
};

var changeTableHandler = function(ev) {
  var newElem = participantsStorage.getCurrentElem();
  var id = newElem['_id'];
  var editableRow = [].filter.call(this.rows, function(row) {
    return id == row.id;
  });
  if (editableRow[0]) {
    Object.keys(newElem).forEach(function(key, i) {
      editableRow[0].cells[i].textContent = newElem[key];
    });
  } else {
    this.appendChild(
      createRowElm(newElem)
    );
  }

}
var removeRowTableHandler = function(ev) {
  var elem = participantsStorage.getCurrentElem();
  var id = elem['_id'];
  var removedRow = [].filter.call(this.rows, function(row) {
    return id == row.id;
  });
  if (removedRow[0]) {
    this.removeChild(removedRow[0]);
  }

};
var clickTableHandler = function(ev) {
  var trId;
  if (ev.target.tagName == 'BUTTON') {
    trId = ev.target.parentElement.parentElement.id;
    switch (ev.target.name) {
      case 'edit':
        participantsStorage.setCurrentElem(participantsStorage.getElem(trId));
        registrationFormElm.dispatchEvent(changeForm);
        break;
      case 'remove':
        participantsStorage.removeElem(trId);
        participantsTableElm.tBodies[0].dispatchEvent(removeRowTable);
        break;
      default:
    }
  }
}

var createButton = function(name, className) {
  var button = document.createElement('button');
  button.name = name.toLowerCase();
  button.classList.add('btn');
  button.classList.add(className);
  button.textContent = name;
  return button;
}
var createRowElm = function(obj) {
  var tr = document.createElement('tr');
  var td;
  tr.id = obj['_id'];
  Object.keys(obj).forEach(function(key) {
    td = document.createElement('td');
    td.textContent = obj[key];
    tr.appendChild(td);
  });
  [['Edit', 'btn-warning'], ['Remove', 'btn-danger']].forEach(function(val) {
    td = document.createElement('td');
    td.appendChild(createButton(val[0], val[1]));
    tr.appendChild(td);
  })
  return tr;
};

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
var clickWinnerBtnHandler = function(ev) {
  var id = getRandomInt(1, participantsStorage.getCount() + 1);
  var participant = participantsStorage.getElem(id);
  winnerElm.textContent = participant['name'] + ' ' + participant['surname'];
}

registrationFormElm.addEventListener('submit', saveFormHandler);
registrationFormElm.addEventListener('changeForm', changeFormHandler);
registrationFormElm.addEventListener('resetForm', resetFormHandler);

participantsTableElm.tBodies[0].addEventListener('click', clickTableHandler);
participantsTableElm.tBodies[0].addEventListener('changeTable', changeTableHandler);
participantsTableElm.tBodies[0].addEventListener('removeRowTable', removeRowTableHandler);

checkWinnerBtnElm.addEventListener('click', clickWinnerBtnHandler);

function render() {
  var participants = participantsStorage.getStorage();
  Object.keys(participants).forEach(function(id) {
    participantsTableElm.tBodies[0].appendChild(
      createRowElm(participants[id])
    );
  });
}

render();
