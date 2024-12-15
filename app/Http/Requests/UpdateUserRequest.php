<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
{
    return [
        'name' => 'required|string|max:55',
        'email' => [
            'required',
            'email',
            // Unique rule excluding the current user's email
            'unique:users,email,' . $this->user->id,
        ],
        'username' => [
            'required',
            'string',
            'min:4',
            // Ensure username is unique in the users table, excluding the current user's username
            'unique:users,username,' . $this->user->id,
        ],
        'password' => [
            'nullable', // Make password field optional
            'confirmed',
            Password::min(8)
                ->letters()
                ->symbols(),
        ],
    ];
}

}
