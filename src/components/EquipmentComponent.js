class EquipmentComponent extends Component {
	constructor(gameObject) {
		super();
		if(gameObject === undefined) {
			throw "Must pass in a GameObject to use this component.";
		}
		if(gameObject.defineTransforms === undefined) {
			throw "GameObject must have a defineTransforms method";
		}

		gameObject.equipmentTransforms = {};
		for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
			gameObject.equipmentTransforms[EQUIPMENT_TYPES[i]] = [];
		}

		gameObject.attack = 0;
		gameObject.defense = 0;

		

		gameObject.nothingEquipmentSlot = function(slot) {
			let result = [];

			for(let i = 0; i < gameObject.equipmentTransforms[slot].length; i++) {
				if(gameObject.colors === undefined || gameObject.colors[slot] === undefined
					|| gameObject.blocks === undefined || gameObject.blocks[slot] === undefined)
				{
					continue;
				}
				result.push(new GeometryRendererComponent(gameObject.colors[slot], gameObject.blocks[slot], gameObject.equipmentTransforms[slot][i].position.x, gameObject.equipmentTransforms[slot][i].position.y));
			}

			return result;
		};
		
		gameObject.noEquipment = function() {
			let equip = noEquipment();
			for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
				equip[EQUIPMENT_TYPES[i]].components = gameObject.nothingEquipmentSlot(EQUIPMENT_TYPES[i]);
			}

			return equip;
		};

		gameObject.canEquipmentPut = function(item) {
			return item instanceof Equipment && gameObject.equipment[item.slot].name === "Nothing";
		};

		gameObject.equipmentPut = function(item) {
			if(item === null || (gameObject.equipment[item.slot] != null && gameObject.equipment[item.slot].name != "Nothing"))
			{
				return false;
			}

			gameObject.equipment[item.slot] = item;
			gameObject.equipment[item.slot].components = gameObject.nothingEquipmentSlot(item.slot);
			for(let i = 0; i < gameObject.equipment[item.slot].components.length; i++) {
				gameObject.equipment[item.slot].components[i].color = item.attributes.color;
			}
			gameObject.refreshEquipment();
			return true;
		};

		gameObject.equipmentRemove = function(slot) {
			if(gameObject.equipment[slot] != null && gameObject.equipment[slot].name === "Nothing")
			{
				return null;
			}

			let item = gameObject.equipment[slot];
			gameObject.equipment[slot] = nothing(slot);
			gameObject.equipment[slot].components = gameObject.nothingEquipmentSlot(slot);
			gameObject.refreshEquipment();
			return item;
		};

		gameObject.refreshEquipment = function() {
			gameObject.defense = 0;
			gameObject.attack = 0;
			for(let i = 0; i < gameObject.components.length; i++) {
				if(gameObject.components[i] instanceof Equipment) {
					gameObject.components.splice(i, 1);
					i--;
				}
			}
			for(let i = 0; i < EQUIPMENT_TYPES.length; i++) {
				gameObject.components.push(gameObject.equipment[EQUIPMENT_TYPES[i]]);
				gameObject.defense += gameObject.equipment[EQUIPMENT_TYPES[i]].attributes.defense;
				gameObject.attack += gameObject.equipment[EQUIPMENT_TYPES[i]].attributes.attack;
			}
		};

		gameObject.defineTransforms();
		gameObject.equipment = gameObject.noEquipment();
		gameObject.refreshEquipment();
	}
}