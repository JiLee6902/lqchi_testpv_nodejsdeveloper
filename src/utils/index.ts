'use-strict'
import _ from 'lodash'
import { Types } from 'mongoose';
import { object } from 'zod';

/**
 * 
 * @param id 
 * @returns objectId
 */
const convertToObjectId = (id: string | number): Types.ObjectId => {
    return new Types.ObjectId(id)
};

/**
 * @param params - danh sách các trường cần lấy 
 * @param params.field - mảng chứa các trường cần lấy
 * @param params.object - đối tượng ban đầu
 * @returns - đối tượng đã được chọn lọc
 */
const getInfo = ({
    fields = [],
    object = {}
}: {
    fields: string[];
    object: Record<string, any>;
}): Partial<Record<string, any>> => {
    return _.pick(object, fields)
}


/**
 * @desc - content email và param thay đổi
 * @param params.template - chứa content email
 * @param params.params - những thông tin cần thay đổi trong email
 * @returns - email đã được chọn lọc
 */
const replaceEmail = (
    {
        template,
        params
    }: {
        template: string;
        params: Record<string, any>;
    }
) => {
    Object.keys(params).forEach(e => {
        const placeHolder = `{{${e}}}`
        template = template.replace(new RegExp(placeHolder, 'g'), params[e])
    });
    return template;
}

export {
    convertToObjectId,
    getInfo,
    replaceEmail
}