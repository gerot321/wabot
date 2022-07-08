import {BaseSequelizeModel} from '../model/mysql/BaseSequelizeModel';

export class ModelUtil{
	static async updateHasMany(model: typeof BaseSequelizeModel, relationId: {name: string, value: number}, oldList: BaseSequelizeModel[], newList: any[]){
		const oldListById = {};
		const newListById = {};

		oldList.map( item => {
			oldListById[item.id] = item;
		})
		newList.map( item => {
			newListById[item.id] = item;
		})

		for(const newItem of newList){
			if (!oldListById[newItem.id]) {
				//Add record that is not exist in old list, but exist in new list

				if (relationId) newItem[relationId.name] = relationId.value;
				delete newItem.id;
				model.create(newItem);
			} else {
				//Update record that is exist in old and new list, updating other attributes

				const oldItem = oldListById[newItem.id];
				for (const attributeKey in newItem){
					const attributeValue = newItem[attributeKey];
					oldItem[attributeKey] = attributeValue;
				}
				oldItem.save();
			}
		}

		//Delete record that is not exist in new list, but exist in old list
		for(const oldItem of oldList){
			if (!newListById[oldItem.id]) {
				oldItem.destroy();
			}
		}
	}
}
