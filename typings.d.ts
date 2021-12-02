import { Attendance } from './models/attendance';
import { Guild, Colours } from './models/guild';
import { Lesson, Instructors } from './models/lesson';

declare global {
	export { Attendance } from './models/attendance';
	export { Guild, Colours } from './models/guild';
	export { Lesson, Instructors } from './models/lesson';
}